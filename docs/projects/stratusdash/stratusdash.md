# StratusDash - 04-2025 t/m heden

Mijn rollen als Product Engineer waren met dit product veelzijdig:

- Software: Full-stack development (embedded, backend, frontend).
- Hardware: Component sourcing en enclosure design (3D-modellering).
- Fabricage: Prototyping, houtbewerking en end-to-end assemblage.

![perfecte productfoto](image.png)

StratusDash is een op maat gebouwd slim weerstation met een groot 7,5-inch e-paperdisplay. Het werkt als een met wifi verbonden IoT-apparaat dat elke 15 minuten je binnenklimaat meet en externe weersverwachtingen toont. Het apparaat is batterijgevoed en kan 3-5 maanden werken zonder op te laden. Ik heb zeven units gemaakt als pilot-batch en geleverd aan echte gebruikers.

## De architectuur

### De Hardware

Het apparaat bestaat uit de volgende componenten:

- Firebeetle 2 ESP32E
- 2500 mAh LiPo batterij (haalt de 6 maanden na optimalisatie, momenteel 3-4 maanden)
- 7.5 inch GoodDisplay B/W ePaper scherm (met HAT)
- BME280 luchtdruk, luchtvochtigheid en temperatuursensor

De Firebeetle 2 ESP32 E is gekozen door het lage stroomverbruik in deep sleep en de LiPo connector.

#### Batterijduur

Mijn doel was 6 maanden batterijduur. Verder heb ik door middel van mijn CoulombCounter nog de sluipstroom kunnen minimaliseren naar 54 uA. Een volgende versie met bijv. een PCB zou MOSFETs kunnen gebruiken om de display HAT elektrisch te isoleren wat het drastisch kan verlagen. Maar er ligt nu een hogere prioriteit op het verlagen van de actieve tijd. Dat gebruikt het grootste gedeelte van de stroom. Hiervoor is een ESP-IDF rewrite handig, aangezien we dan de HTTP connectie open kunnen laten en session resumption kunnen gebruiken (TLS vereist vrij veel tijd). De twee API requests zijn nu ongeveer 2-4 seconden per stuk.

Een andere optimalisatie is het gebruiken van een statisch IP, zodat de wifi-verbinding sneller klaar is. Dit zou nog een aantal seconden van de wakkertijd afhalen. Momenteel is het apparaat 12-18 seconden wakker, door de API requests naar de 0.5s per stuk te halen en wifi-verbinding te optimaliseren kan dit naar de 6 tot 8 seconden gaan, waardoor we de batterijduur bijna kunnen verdubbelen.

### De firmware

De firmware draait op momenteel op Arduino met een ingeplande refactor naar ESP-IDF. Het heeft de volgende functionaliteiten:

- Veilige pairing met gebruikersaccounts: Het apparaat koppelt met een account om online o.a. de layout en de locatie aan te kunnen passen. Over dit proces [is hier meer te lezen](stratusdash-pairing.md), het is heel interessant!
- Custom Layouts: De layouts worden ingeladen met JSONs van de backend. Hier kunnen iconen, tabellen en tekst over het hele scherm geplaatst worden. Deze layout wordt opgeslagen op het apparaat zelf.
- Modulaire Firmware: De firmware bestaat uit veel verschillende modules, layout rendering zit in LayoutRenderer, SystemScreens zorgt voor o.a. de pairing en foutmelding schermen, WiFi Provisioning wordt behandeld in WifiProvisioning. OTAManager, SceenDriver, BatteryManager etc. 12 in totaal.

### De Backend

De FastAPI backend draait op een VPS in Duitsland.

- Weather Cache: Voor elke locatie vraagt de backend weerinformatie op van de WeatherAPI en slaat deze op in de cache (in de database). Dit zorgt ervoor dat we zo efficient mogelijk omgaan met externe API calls.
- Over-The-Air (OTA) Updates: De backend faciliteert de OTA. Elk apparaat kan als dev of als stable gemarkeerd worden en krijgt alleen die updates. Het apparaat weet hier zelf niks van af. Dit zorgt ervoor dat ik kan testen met mijn eigen apparaat, zodat ik niet per ongeluk een foutieve build deploy.
- MariaDB & Alembic: De database is ontworpen met strikte validatie op database-niveau. Door middel van CHECK constraints (bijv. voor sensor-ranges en batterijvoltages) wordt corrupte data geweigerd voordat het weggeschreven kan worden. Daarnaast maken foreign keys met CASCADE DELETE het beheren van gebruikersdata veilig en eenvoudig; als een gebruiker zijn account verwijdert (vereist voor de GDPR), worden alle gekoppelde apparaten, tokens en sensor-readings automatisch opgeschoond. Databasemigraties worden as-code beheerd via Alembic.

### De Frontend

- Sticky Pairing URL: Als jij de QR code scant van het apparaat en je hebt nog geen account, dan blijft de link plakken, zodat wanneer "Verifieer Email" geklikt wordt in de mail je direct wordt ingelogd en naar het koppelen doorverwezen wordt. Zie [hier voor meer](stratusdash-pairing.md).
- Privacy Policy / GDPR: Er is een privacy policy en een manier om je account te verwijderen. Dit betekent dat de website conform is aan de EU-regelgeving.
- Location Guess: Bij het configureren van een apparaat moet je de locatie instellen. Dit veld wordt ingevuld door een IP adres locatie als gok, wat je dan kan aanpassen mocht het niet kloppen. De coordinaten zijn totaal niet zichtbaar voor de gebruiker.

## Gerelateerde Documenten

De [Pairing Architectuur](stratusdash-pairing.md) beschrijft in detail hoe het koppelingsproces werkt: van QR-code generatie op het apparaat tot de beveiligde claim-flow in de backend. Verder is de [Coulomb Counter](../coulombcounter/alflex-coulomb-counter.md) gebruikt om het stroomverbruik van het apparaat in kaart te brengen en te optimaliseren.
