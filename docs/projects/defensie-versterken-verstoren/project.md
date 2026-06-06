# Defensie: Versterken en Verstoren - 03-2026 t/m 06-2026

Dit project was een proof-of-concept voor een akoestische sensor-node die harde geluiden detecteert, audio naar een backend stuurt en daar classificatie via YAMNet mogelijk maakt. Mijn bijdrage lag bij embedded firmware, certificaatverificatie en security-analyse van de netwerkarchitectuur.

**Mijn rol:** Embedded Firmware & Security Engineer

## Context

Het project werd uitgevoerd binnen de studio Dark Tech en had een sterke focus op technologie, veiligheid en ethiek. Het team werkte aan een sensorconcept dat in een tactische context signalen zoals voertuigen of schoten zou kunnen detecteren.

De frontend en AI-classificatie werden vooral door teamgenoten ontwikkeld. Mijn werk zat aan de sensor-node en de vraag of de architectuur veilig en praktisch genoeg was voor een realistische inzetcontext.

## Het probleem

Een akoestische sensor-node is technisch niet alleen een audioproject. In een tactische context tellen ook betrouwbaarheid, energieverbruik, zichtbaarheid, netwerkveiligheid en misbruikrisico's.

De eerste architectuur werkte als prototype, maar was kwetsbaar: audio ging naar een backend, de netwerkroute was nog niet sterk genoeg beveiligd en de communicatiekeuzes pasten niet goed bij een omgeving met elektronische oorlogsvoering.

## Wat ik implementeerde

Ik werkte aan de ESP32-firmware voor de sensor-node. De node luistert naar audio, detecteert relevante geluidsniveaus en stuurt audiochunks naar de backend voor classificatie.

Een belangrijk deel van mijn implementatie was het verbeteren van de netwerkbeveiliging. Ik implementeerde HTTPS met certificaatverificatie via `WiFiClientSecure`, zodat de sensor niet blind data naar een endpoint stuurt zonder de serveridentiteit te controleren.

Ook onderzocht ik een low-level audio-opzet met een analoge piëzo-contactmicrofoon en DMA double buffering. Deze oplossing werkte technisch, maar de audiokwaliteit was niet goed genoeg voor AI-classificatie. Daarom stapte ik over op een digitale I2S-microfoon. Dat was minder "clever", maar beter voor het systeemdoel.

## Wat ik analyseerde en adviseerde

Naast implementatie maakte ik een security-analyse van de architectuur. Daarin keek ik naar Man-in-the-Middle-aanvallen, apparaat-authenticatie, spoofing, SNI-lekkage, VPN-overhead, WiFi-zichtbaarheid, LTE-afhankelijkheid en LoRa-bandbreedte.

Mijn belangrijkste aanbeveling was dat een toekomstige versie minder ruwe audio zou moeten versturen. Door Edge AI lokaal op de sensor te draaien, hoeft de node alleen nog kleine metadata of classificatie-events te verzenden. Dat maakt LoRa of mesh-communicatie realistischer en verlaagt de elektromagnetische zichtbaarheid.

## Belangrijke technische keuzes

### DMA was niet automatisch de beste oplossing

De DMA double-buffer werkte: terwijl de hardware de ene helft van de buffer vulde, kon de firmware de andere helft verwerken. Toch heb ik die route verlaten omdat de piëzo-microfoon onvoldoende bruikbare audio opleverde.

Dit was een goede systeemles: een technisch nette implementatie is niet waardevol als de data niet geschikt is voor het einddoel.

### Certificaatverificatie was noodzakelijk

Alleen "HTTPS gebruiken" is niet genoeg wanneer een embedded device de serveridentiteit niet goed valideert. Door certificaatverificatie toe te voegen werd de verbinding beter beschermd tegen Man-in-the-Middle-aanvallen.

### WiFi en ruwe audio passen slecht bij tactische inzet

WiFi is zichtbaar en ruwe audio vraagt relatief veel bandbreedte. LoRa is juist interessant door bereik en lage zichtbaarheid, maar kan geen ruwe audio dragen. Daarom kwam mijn advies uit op lokale classificatie en het verzenden van compacte events.

## Ethische reflectie

De focus van de studio Dark Tech lag voornamelijk op ethiek. Dit product, mocht dit geïmplementeerd worden, komt ook met ethische kwesties. Zou je zo'n systeem als overheid in risicogebieden al moeten installeren? Wat doe je dan met deze data? Deze vragen hebben wij als team ook gesteld en behandeld.

<!-- Ik wil deze sectie verder uitwerken. -->

## Resultaat

Het project leverde een werkende proof-of-concept sensor-node op en een duidelijker beeld van wat een volgende iteratie nodig heeft: betere device-authenticatie, minder afhankelijkheid van ruwe audio, lokale classificatie en een communicatievorm die past bij tactische beperkingen.

Voor mijn portfolio laat dit project vooral zien dat ik niet alleen naar code kijk, maar ook naar dreigingsmodellen, operationele beperkingen en de vraag of een technische keuze in de echte context standhoudt.

## Gerelateerde documenten

- [Security Research](security-research.md): Onderzoek naar de staat van het project wat betreft veiligheid.

## Gebruikte technologieën

`C++` `ESP32` `I2S Audio` `DMA` `WiFiClientSecure` `HTTPS` `Cloudflare Tunnels` `YAMNet` `Threat Modeling`
