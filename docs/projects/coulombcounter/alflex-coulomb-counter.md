# Coulomb Counter - Alflex Technologies - 09-2025 t/m 02-2026

Tijdens mijn stage bij Alflex Technologies ontwikkelde ik een autonome Coulomb Counter voor langdurige stroommetingen aan ultra-low-power IoT-apparaten. Het systeem moest weken tot maanden kunnen meten zonder constante pc-verbinding, data betrouwbaar bufferen en afwijkingen in stroomverbruik zichtbaar maken.

**Mijn rol:** Embedded Software Stagair

## Context

Alflex ontwikkelt IoT-apparaten die jarenlang op een batterij moeten draaien. Om zulke producten te valideren is langdurig meten essentieel. Bestaande meetoplossingen zoals de Joulescope JS110 zijn zeer accuraat, maar minder geschikt voor autonome veldmetingen: ze vereisen een pc-verbinding, genereren veel data en de software werd instabiel bij tests langer dan ongeveer 12 uur.

Mijn opdracht was het doorontwikkelen van een intern prototype tot een betrouwbaar embedded meetsysteem met een ATtiny1616 meetmodule en een ESP32-S3 controlmodule.

## Het probleem

Het apparaat moest drie dingen tegelijk goed doen:

- zeer kleine en grote stromen betrouwbaar meten (0,1 uA tot 2,5 A);
- meetdata betrouwbaar naar een backend sturen en tijdelijk lokaal bufferen bij verbindingsverlies;
- offline metingen lokaal bufferen zonder de beperkte flashopslag te snel te verslijten.

Daarnaast moest het systeem praktisch bruikbaar zijn voor engineers: starten, meten, synchroniseren en achteraf analyseren in dashboards. 

Wanneer de MQTT-broker niet bereikbaar was, bufferde het apparaat de metingen lokaal op flash. Wanneer de Python-consumer niet beschikbaar was, bleven de berichten in de MQTT-broker staan. Berichten werden pas bevestigd nadat ze succesvol in de database waren opgeslagen. Tijdens de online- en offlinetests is daarbij geen meetdata verloren gegaan. Bij eventueel pakketverlies kan de exacte tijdverdeling minder nauwkeurig worden, terwijl de cumulatieve lading reconstrueerbaar blijft.

## Wat ik bouwde

Ik bouwde de firmware-architectuur opnieuw op rond een voorspelbare non-blocking superloop. De ATtiny1616 telt pulsen en stuurt geaggregeerde meetdata via UART naar de ESP32-S3. De ESP32 beheert de meting, buffering, opslag, MQTT-communicatie, statusinformatie en synchronisatie met de backend.

Voor de backend koos ik een hybride opzet:

- **InfluxDB** voor tijdsreeksdata.
- **MariaDB** voor metadata, context, firmwareversies, testnamen en apparaatdata.
- **Grafana** voor analyse en visualisatie.
- **Mosquitto MQTT** voor telemetrie.

## Waarom ik de hele firmware opnieuw ben begonnen

In het begin probeerde ik te snel complexe communicatie en RTOS-taken op te zetten, deels met AI-gegenereerde code. Omdat de opdracht zo groot was, dacht ik dat ik snel grote stappen moest zetten om alles op tijd af te krijgen. Dat leidde, in combinatie met een ambitieuze planning, tot instabiele firmware, onduidelijke stack overflows en code waar ik te weinig controle over en begrip van had.

Na een stevige code review heb ik bewust twee weken afstand genomen van de implementatie. Ik ben dieper in C gedoken, heb de firmware rustig opnieuw ontworpen en ben teruggegaan naar een eenvoudigere architectuur die ik volledig begreep. Ik vermeed eigen dynamische geheugenallocatie en koos voor expliciete state, vaste buffers en een voorspelbare superloop met losse modules, elk met een eigen verantwoordelijkheid en state.

Dat was een belangrijk leerpunt: voor embedded systemen is "het compileert" niet genoeg. Je moet kunnen uitleggen waarom het stabiel blijft. Als je een stack overflow tegenkomt, vergroot de stack dan niet blind. Onderzoek eerst waardoor het geheugengebruik groeit en los de oorzaak op. Daarna heb ik deze aanpak vaker toegepast: minder symptoombestrijding en problemen vaker direct bij de oorzaak oplossen. Een voorbeeld was de MQTT-outbox: in plaats van simpelweg meer geheugen toe te wijzen, heb ik onderzocht waarom berichten zich ophoopten en de hoeveelheid berichten in de outbox gelimiteerd.

## Belangrijke technische keuzes

### UART in plaats van directe ESP32 pulse counting

De ESP32 moest tot ongeveer 62.000 pulsen per seconde kunnen verwerken naast WiFi, displaytaken en communicatie. Directe CPU-interrupts waren te zwaar. De PCNT-hardwaremodule leek ideaal, maar volgens de analyse en de embedded engineers zouden WiFi-interrupts timingafwijkingen kunnen veroorzaken van 1 tot 10 procent.

De pragmatische keuze was om de ATtiny1616 het telwerk te laten doen. Die aggregeert pulsen en stuurt elke 100 ms een update via UART. Dat verlaagde de tijdsresolutie iets, maar maakte het systeem stabiel en betrouwbaar binnen de projectplanning.

### Binair MQTT-protocol

Ik ontwierp een compact binair MQTT-protocol met headers, sequence IDs, run IDs, timestamps en cumulatieve pulstellingen. Daardoor kan de backend bij pakketverlies de totale lading blijven reconstrueren. In het slechtste geval gaat tijdsresolutie verloren, maar niet de totale meetdata.

### Offline opslag op raw flash

Voor offline metingen koos ik geen bestandssysteem, maar een sequentiële buffer op een ruwe flashpartitie. De meetdata heeft een vaste structuur van 4 bytes per event, waardoor bestandssysteemoverhead relatief duur zou zijn. Door data te aggregeren en per flashpagina met CRC op te slaan, kan het apparaat langdurig offline meten met controle over opslagduur, wear-leveling en dataintegriteit.

Het uploaden van deze data was ook een leuk probleem: ik had te maken met een MQTT-outbox die snel te vol raakte. Daarom heb ik een systeem geïmplementeerd met drie fasen.

- De pakketjes werden van flash afgelezen door de OfflineHandler en naar de DataTransport module gestuurd.
- De DataTransport module heeft 2 MB PSRAM waar alle data in werd gebufferd. Mocht dit vol zitten dan wachtte de OfflineHandler totdat er weer 20% beschikbaar zou zijn via een callback.
- De DataTransport module stuurde deze data als MQTT-pakketjes op, maar zorgde er altijd voor dat er niet meer dan een bepaalde hoeveelheid pakketjes in de MQTT-outbox vast zouden zitten. Mocht dit wel zo zijn, dan wachtte de module totdat er weer wat bij kon.

Zonder backpressure bleef de MQTT-outbox groeien, waardoor het geheugengebruik opliep en de firmware uiteindelijk instabiel werd.

### Hybride database

InfluxDB is sterk voor tijdsreeksdata, maar gevoelig voor high cardinality wanneer te veel metadata als tags wordt opgeslagen. Daarom slaat MariaDB alle context op en schrijft InfluxDB alleen de ruwe meetdata weg, gekoppeld via een UUID. Grafana combineert beide werelden via dashboard variables.

## Validatie

Een meetinstrument is pas nuttig als de data klopt. Daarom ontwierp ik een testprotocol waarbij de Coulomb Counter in serie werd geplaatst met een Joulescope JS110 als referentie.

Het systeem werd getest over een groot dynamisch bereik: van 0,1 uA slaapstroom tot 2 A actieve piekstroom. Voor de drie geteste Coulomb Counters bleef de afwijking in cumulatief gemeten lading na meer dan 100 uur onder 1% ten opzichte van de Joulescope JS110.

## Resultaat

Het resultaat was een stabiel embedded meetsysteem dat autonoom kan meten, data online naar een dockerized backend pusht en offline meetdata lokaal kan bufferen. De firmware werd begrijpelijker, voorspelbaarder en beter te valideren dan het oorspronkelijke prototype.

Dit project laat voor mij het duidelijkst zien dat ik kan omgaan met serieuze embedded beperkingen: timing, geheugen, flashslijtage, dataverlies, validatie en systeemarchitectuur.

## Wat ik leerde

Ik leerde vooral dat betrouwbaarheid een ontwerpkeuze is. Simpele architectuur is niet minder professioneel wanneer de constraints daarom vragen. De overstap van complexe RTOS-code naar een voorspelbare superloop was geen stap terug, maar de keuze die het systeem stabiel maakte.

Ook leerde ik hoe belangrijk meetbare acceptatiecriteria zijn. De 1 procent-grens en 100+ uur test maakten het resultaat veel sterker dan "het lijkt te werken".

## Technische proof

- [MQTT Protocol Spec](mqtt-protocol-spec.md) - technische specificatie van het binaire protocol.
- [Flash Storage](flash-storage.md) - onderzoeksfragment over offline opslag, aggregatie, CRC en flashbeperkingen.

## Gebruikte technologieën

`C` `ESP-IDF` `ATtiny1616` `ESP32-S3` `UART` `MQTT` `Mosquitto` `Python` `InfluxDB` `MariaDB` `Grafana` `Docker`
