# Onderzoek: Netwerk & Security

!!! note "Security Onderzoek"
    Deze pagina is documentatie voor onze opdrachtgever.
    Dit document is in originele staat hier te lezen om mijn documentatieproces en onderzoek te tonen.

## 1. Huidige Architectuur en Beperkingen

Momenteel werkt het systeem als volgt:

1. De ESP32 start op en verbindt met WiFi.
2. De ESP32 detecteert een luid geluid en begint met versturen.
3. De ESP32 stuurt voor 20 seconden geluid per batch.
4. Als er nog steeds een luid geluid is, blijft het versturen, anders stopt het versturen.
5. De ESP32 geeft door dat dit het einde is van de opname aan de backend.
6. De backend plakt alle losse bestandjes aan elkaar en stuurt ze naar de AI analyse.

Dit systeem vereist een actieve internetverbinding met WiFi. Het doel van dit apparaat is om vijandelijke activiteiten te kunnen detecteren. Als het apparaat een actieve WiFi-verbinding vereist, dan is het vrij zichtbaar voor een voorzichtige en slimme vijand. Dit is ook makkelijk te verstoren, waardoor onze oplossing niet meer informatie kan doorgeven. Dat is een van de grootste beperkingen.

Verder stuurt het embedded apparaat ruwe audiobestanden naar HTTPS endpoints, maar we verifiëren de serveridentiteit niet. Dit zorgt ervoor dat het apparaat vatbaar is voor Man-in-the-Middle aanvallen (MITM). Iemand op hetzelfde netwerk kan de audio-opnames onderscheppen en/of manipuleren. In deze militaire context is dat natuurlijk een groot probleem.

## 2. Beveiliging van de Dataverbinding

MITM-aanvallen kunnen goed aangepakt worden. Door te verifiëren of de backend wel onze backend is, met een certificaat, kunnen we zeker zijn dat onze data naar de juiste plek gaat. Dit is goed te doen met de ``WifiClientSecure`` library.

### VPN Verbinding

Hoewel de opdrachtgever adviseerde om een beveiligde VPN-verbinding te onderzoeken, is dit voor de huidige hardware (ESP32) op korte termijn niet de meest logische of haalbare keuze. Hier zijn een aantal redenen voor:

- **Overhead en Rekenkracht:** Een VPN-client (zoals OpenVPN of WireGuard) draaien op een microcontroller zoals de ESP32 kost relatief veel geheugen (RAM) en processorkracht. Omdat de ESP32 momenteel al zwaar belast wordt met het verwerken en doorsturen van de ruwe audiobestanden, kan de extra overhead van een VPN leiden tot instabiliteit of dataverlies.
- **Netwerkcomplexiteit:** Het opzetten, beheren en in stand houden van een VPN-tunnel op een embedded device is complexer dan een enkele HTTPS-verbinding. Als de VPN-verbinding wegvalt in het veld, is de herstelprocedure vaak trager.
- **Doelmatigheid:** Het apparaat hoeft niet deel uit te maken van een compleet afgeschermd virtueel netwerk; het hoeft alleen veilig te communiceren met één specifieke backend API. HTTPS met strikte certificaatverificatie (`WiFiClientSecure`) biedt hiervoor voldoende end-to-end encryptie en authenticatie, met een fractie van de overhead.

Maar er is nog wel een reden voor een VPN. Ja, ons netwerkverkeer is veilig, de vijand kan niet kijken wat er vervoerd wordt. Ze kunnen wel kijken waar het naartoe gaat. Om te zorgen dat het request bij de juiste server uitkomt, wordt het hoofddomein tijdens de zogenaamde TLS-handshake onversleuteld meegestuurd via _Server Name Indication (SNI)_. Een VPN-verbinding zou deze informatie verbergen door de versleutelde verbinding met de VPN server.

Een VPN-oplossing is daarom een optie voor een latere fase, bijvoorbeeld wanneer de architectuur verandert naar een zwaardere single-board computer (zoals een Raspberry Pi) in plaats van een microcontroller.

### Authenticatie van het apparaat

Momenteel hebben wij geen authenticatie per apparaat. Dit betekent dat iedereen die precies weet wat onze endpoints accepteren, data kan opsturen. Deze data gaat dan ook door de AI analyse heen en kan onze data verpesten. Een vijand kan bijvoorbeeld een heleboel schoten of voetstappen doorgeven, wat kan leiden tot militaire actie, wat kan leiden tot materiaalverlies.

Door elk apparaat bijvoorbeeld een token te geven kunnen we onderscheid houden tussen apparaten en wordt alles veiliger. Door de HTTPS encryptie zijn deze tokens veilig.

## 3. Connectiviteit in het Veld

Momenteel gebruikt het apparaat een WiFi-verbinding. Dit is in het veld natuurlijk wat minder handig, een WiFi-netwerk is enorm zichtbaar. Het is makkelijk te verstoren en dan zijn alle apparaten nutteloos. Ook is het bereik van WiFi beperkt waardoor je voor elk apparaat een eigen WiFi-netwerk moet opzetten. Maar wat voor andere opties bestaan er dan?

### LTE - Mobiel netwerk (4G)

Een 4G-module lost het probleem van het beperkte bereik op. Iedere sensor kan overal geplaatst worden zolang er mobiele dekking is. Bovendien is de bandbreedte van 4G hoog genoeg om onze ruwe audiobestanden door te sturen naar de backend. Er zijn echter ook nadelen: in een operationele of conflictomgeving zijn civiele zendmasten vaak de eerste doelwitten, waardoor de infrastructuur onbetrouwbaar is. Daarnaast verbruikt een actieve 4G-verbinding veel stroom en is het zendsignaal nog steeds peilbaar voor de vijand. Voor het huidige schoolproject valt een 4G-oplossing inclusief dataplannen bovendien buiten het budget.

### LoRa

LoRa is een technologie ontworpen voor verbindingen over grote afstanden met minimaal stroomverbruik. Het is veel moeilijker te detecteren en te verstoren dan WiFi of 4G, wat het tactisch gezien superieur maakt. Het kritieke nadeel van LoRa is de extreem lage bandbreedte (data throughput). Het is fysiek onmogelijk om 20 seconden aan ruwe audio over een LoRa-netwerk te sturen. LoRa wordt pas een haalbare optie wanneer de architectuur verandert naar _Edge AI_: als we het AI-model lokaal op de ESP32 draaien, hoeft het apparaat alleen nog maar een paar bytes aan tekst te sturen (bijv. "5, 92"). Hier staat 5 dan voor een explosie en 92% voor de zekerheid.

### Alternatieven

Andere militaire opties zijn tactische Mesh-netwerken. Hierbij fungeert elke ESP32 als een eigen router die signalen van andere sensoren doorstuurt (een 'ketting' van apparaten). Dit vergroot het bereik enorm zonder dat er één centrale hotspot of zendmast nodig is. Valt er één apparaat uit, dan zoekt het netwerk automatisch een andere route. Dit vereist wel een compleet andere netwerkarchitectuur en firmware en is vrij complex.

## 4. Conclusie en Aanbevelingen voor Sprint 3+

Er zijn bepaalde dingen die we moeten implementeren, zoals TLS verificatie om MITM aanvallen tegen te gaan. Als dat geïmplementeerd is hebben wij volledige end to end encryptie van alle data. Een VPN verbinding is te complex, maar biedt wel extra veiligheid richting onze domeinen. Verder is apparaat-specifieke authenticatie een vereiste om te implementeren. Zonder dit kan iemand die weet wat voor data onze API accepteert onze data verpesten met neppe data.

Edge AI en LoRa zijn wel de juiste richting voor dit product, maar momenteel te complex om goed te implementeren. Hier moet zeker wel onderzoek naar gedaan worden, want het staat ons toe om compleet van WiFi/LTE af te stappen. Hierdoor zal het apparaat een stuk robuuster en minder zichtbaar worden op het elektromagnetische spectrum.
