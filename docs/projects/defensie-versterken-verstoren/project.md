# Defensie: Versterken en Verstoren - 03-2026 t/m 06-2026

**Mijn Rol:** Embedded Firmware & Security Engineer

*Een proof-of-concept voor een gedistribueerd, akoestisch sensornetwerk, ontworpen in samenwerking met het 101 CEMA Bataljon om te waarschuwen voor vijandelijke activiteiten door middel van AI-audioclassificatie.*

In de basis is dit project een autonome akoestische sensor-node. De ESP32 luistert, stuurt audio in chunks bij een hard geluid naar de backend, waar een YAMNet model het classificeert. Binnen dit teamproject heb ik de ontwikkeling van frontend en de AI-classificatie aan mijn teamgenoten overgelaten. Mijn verantwoordelijkheid lag bij de embedded firmware van de sensor-nodes (ESP32) en het in kaart brengen van de netwerk- en operationele veiligheid.

## Technische inzichten & belangrijkste resultaten

In militaire context is betrouwbaarheid en onzichtbaarheid essentieel. De uitdagingen in dit project zaten vooral in de architectuur, hardware-limitaties en security.

### De DMA Double-Buffer (Ping-Pong Buffer)

Om continu audio te kunnen opnemen zonder de main loop (en de wifi-stack) te blokkeren, ontwierp ik initieel een oplossing met een analoge piëzo-contactmicrofoon. Ik schreef een low-level implementatie waarbij de analoge pin met 16 kHz werd uitgelezen en direct via Direct Memory Access (DMA) in een dubbele buffer werd geplaatst.

Zodra de eerste helft van de buffer vol was, vuurde het systeem een interrupt af: de software kon deze helft verwerken en versturen, terwijl de hardware op de achtergrond (via DMA) de tweede helft bleef vullen. Dit werkte technisch perfect, maar in de praktijk bleek dat de audiokwaliteit van de piëzo-microfoon onvoldoende was voor de AI-classificatie. Ik heb deze complexe code daarom geschrapt en ben overgestapt op een standaard digitale I2S-microfoon. De audiokwaliteit van de I2S microfoon werkte goed met de AI-analyse.

### Threat Modeling & Netwerkbeveiliging

Omdat dit systeem bedoeld is voor het slagveld, heb ik een uitgebreide security-analyse uitgevoerd op onze eigen architectuur. Hieruit kwamen een aantal kritieke kwetsbaarheden en oplossingsrichtingen:

- **MITM & Apparaat-Authenticatie:** Het initiele HTTP(S)-verkeer was kwetsbaar voor Man-in-the-Middle aanvallen. Door over te stappen op HTTPS met strikte certificaatverificatie (WiFiClientSecure) is de payload versleuteld. Daarnaast heb ik geadviseerd om unieke device-tokens te implementeren om te voorkomen dat een vijand de backend kan overspoelen met valse audiogegevens ("spoofing").
- **SNI-Lekkage vs. VPN:** De opdrachtgever suggereerde een VPN om de verbinding te verbergen. Mijn analyse toonde aan dat een VPN (zoals WireGuard) te veel RAM en CPU-overhead vereist voor een ESP32. Hoewel HTTPS de inhoud van het verkeer beschermt, lekt het doeldomein nog steeds via *Server Name Indication (SNI)*. Een VPN is pas haalbaar als de node-hardware wordt geüpgraded naar een single-board computer. Uit gesprekken met het 101 CEMA Bataljon bleek dat dit op te lossen is door een VPS in te huren en vanaf daar de data door te sturen met een VPN. Toegang tot een VPS hebben wij niet, maar de rest van ons systeem is qua beveiliging identiek met bepaalde militaire systemen.
- **De Connectiviteits-dilemma's:** Wi-Fi is tactisch onbruikbaar door de hoge zichtbaarheid. LTE (4G) lost het bereikprobleem op, maar civiele zendmasten zijn in conflictgebieden onbetrouwbaar. LoRa is qua stealth ideaal, maar mist de bandbreedte voor ruwe audio. De uiteindelijke aanbeveling voor een toekomstige iteratie is de transitie naar *Edge AI*: door een model lokaal op de ESP32 te draaien, hoeft het apparaat alleen nog maar kleine, binaire metadata te sturen via een Mesh-netwerk of LoRa, wat de elektromagnetische signatuur drastisch verlaagt.

### Ethische Dillema's

De focus van de studio Dark Tech lag voornamelijk op ethiek. Dit product, mocht dit geïmplementeerd worden, komt ook met ethische kwesties. Zou je zo'n systeem als overheid in risicogebieden al moeten installeren? Wat doe je dan met deze data? Deze vragen hebben wij als team ook gesteld en behandeld.

### **Gebruikte technologieën**

`C++` `ESP32` `I2S Audio` `DMA` `Cloudflare Tunnels` `Cybersecurity (Threat Modeling)`
