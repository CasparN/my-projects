---
title: "Defensie: Versterken en Verstoren"
---

# Dark Tech Defensie - 03-2026 t/m 06-2026

Voor Dark Tech bouwden we een sensor-node die harde geluiden opneemt en door YAMNet laat classificeren. Ik schreef de ESP32-firmware, voegde servercertificaatverificatie toe en onderzocht waar de netwerkarchitectuur in een echte omgeving zou falen.

**Mijn rol:** Creative Technologist - embedded firmware en security-analyse

## Context

Binnen de studio Dark Tech onderzochten we of een netwerk van akoestische sensoren schoten en voertuigen kon signaleren zonder zelf een onaanvaardbaar veiligheids- of surveillancerisico te worden.

Teamgenoten bouwden de frontend en AI-classificatie. Ik werkte aan de sensor-node en testte de aannames achter transport, authenticatie en inzetbaarheid.

## Het probleem

De sensor moest meer doen dan bruikbare audio leveren. Hij moest weinig energie verbruiken, moeilijk te detecteren zijn en geen eenvoudige ingang bieden voor onderschepping of vervalste meldingen.

Het prototype stuurde ruwe audio via wifi naar een backend. De serveridentiteit werd niet gecontroleerd, apparaten hadden geen eigen authenticatie en de radioverbinding was zowel storingsgevoelig als waarneembaar.

## Wat ik implementeerde

Ik werkte aan de ESP32-firmware voor de sensor-node. De node luistert naar audio, detecteert harde geluiden en stuurt audiochunks naar de backend voor classificatie.

Met `WiFiClientSecure` liet ik de ESP32 het servercertificaat controleren voordat hij audio verstuurde. Een geldig HTTPS-adres alleen was niet genoeg: zonder die controle kon de sensor met een nagebootste server verbinden.

### De DMA Double-Buffer (Ping-Pong Buffer)

Mijn eerste versie las een analoge piëzo-contactmicrofoon op 16 kHz uit. Een DMA ping-pongbuffer liet de hardware de ene helft vullen terwijl de firmware de andere helft verwerkte. Daardoor bleven de main loop en wifi-stack beschikbaar.

De bufferwissel werkte, maar de piëzo leverde te weinig bruikbare audio voor YAMNet. Ik heb de eigen DMA-code verwijderd en ben overgestapt op een digitale I2S-microfoon met bestaande libraries. Minder eigen code, betere classificatie-input.

## Wat ik analyseerde en adviseerde

Mijn security-analyse vond twee directe problemen: de ESP32 controleerde de serveridentiteit niet en de backend kon niet vaststellen welk apparaat de data verstuurde. Ik onderzocht daarnaast of VPN, LTE, LoRa of een mesh-netwerk de verbinding minder kwetsbaar en minder zichtbaar kon maken. De afwegingen staan in [Security Research](security-research.md).

Ik zou een kleiner, specifieker model naar de ESP32 verplaatsen. De node verstuurt dan alleen een label, confidence-score en tijdstip. Dat past wel binnen de bandbreedte van LoRa of een sober mesh-protocol en voorkomt dat ieder geluid de sensor verlaat.

## Ethische reflectie

De focus van de studio Dark Tech lag niet alleen op wat technisch mogelijk is, maar vooral op wat er gebeurt zodra zo'n techniek echt werkt. Dit prototype lijkt op het eerste gezicht een sensor voor veiligheid: het kan een operator sneller wijzen op geluiden die mogelijk relevant zijn, zoals schoten, impact of voertuigen.

Juist daar zit ook de gevaarlijke kant. Een microfoon neemt niet alleen het bedoelde event op. Hij kan ook stemmen, aanwezigheid, routines en gedragspatronen vastleggen van mensen die niet weten dat ze worden opgenomen. In een defensiecontext kan dat misschien worden verdedigd vanuit veiligheid, maar dezelfde infrastructuur kan ook veranderen in permanente surveillance.

Daarnaast is een AI-classificatie geen bewijs. Een confidence-score kan in een dashboard snel voelen als zekerheid, terwijl het alleen een modelschatting is. Als zo'n detectie zonder verificatie wordt gebruikt voor bijvoorbeeld kinetische actie, verschuift verantwoordelijkheid van mensen naar een systeem dat de context niet begrijpt.

Mijn belangrijkste ethische conclusie is daarom dat akoestische detectie hoogstens een signaleringsinstrument mag zijn. Het systeem mag menselijke aandacht sturen, maar niet zelfstandig betekenis geven aan een situatie. Ruwe audio moet zo min mogelijk worden opgeslagen, bewaartermijnen moeten technisch worden afgedwongen en beslissingen moeten altijd door meerdere bronnen en een mens worden gecontroleerd.

Voor mij maakte dit project vooral duidelijk dat sommige dingen niet beter worden doordat je ze automatiseert. De techniek kan nuttig zijn, maar alleen als het ontwerp expliciet begrenst wat het systeem mag weten, bewaren en veroorzaken.

## Resultaat

De proof-of-concept nam audio op met een ESP32, verstuurde audio via een server-geverifieerde HTTPS-verbinding en liet de backend YAMNet-classificatie uitvoeren. De volgende versie heeft per-device authenticatie en lokale classificatie nodig voordat een ander radioprotocol zinvol wordt.

## Gerelateerde documenten

- Lees de volledige [security-analyse van transport, authenticatie en radiokeuze](security-research.md).

## Gebruikte technologieën

`C++` `ESP32` `I2S Audio` `DMA` `WiFiClientSecure` `HTTPS` `Cloudflare Tunnels` `YAMNet` `Threat Modeling`
