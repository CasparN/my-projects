# Autonomous Vineyard Drone – SAW Aero - 03-2025 t/m 06-2025

**Mijn rol:** Drone Pilot & NDVI Sensor Engineer, ArduPilot Configurator

Dit project richt zich op het ontwikkelen van een autonome drone voor wijngaarden, met als einddoel het monitoren van de gezondheid van de wijnstokken en het optimaliseren van de irrigatie. Ons team heeft een prototype ontvangen van het vorige team, wat de eerste basis vormde, maar er was niet veel documentatie. Door veel onderzoek en reverse engineering hebben we uiteindelijk een autonoom vliegende drone kunnen realiseren, die in staat is om een vooraf bepaalde route te vliegen en data te verzamelen.

![the drone shown on grass](drone-on-grass.png)

## NDVI Sensor

Commerciële NDVI-camera’s zijn duur. Mijn onderzoek liet zien dat ik hun resultaten kon benaderen met een Raspberry Pi NoIR-camera en een blauwfilter. Het principe is om nabij-infrarood (NIR) licht vast te leggen in het rode kanaal van de camera en zichtbaar rood licht in het blauwe kanaal. Door deze beelden te verwerken met een **Python**- en **OpenCV**-script met de formule `(Red - Blue) / (Red + Blue)`, kan ik een visuele index van plantgezondheid genereren. Ik heb met succes een prototype gebouwd dat kan uitlezen van zowel de NoIR- als een standaard RGB-camera.  Op het dashboard heb ik een live feed toegevoegd wat duidelijk live RGB en NDVI beelden toont, wat een mooie demonstratie was. Helaas heb ik door tijdsdruk geen validatie kunnen uitvoeren met echte wijnstokken of een echte analyse kunnen doen.

Dit project toont dat ik de volgende skills heb ontwikkeld:

- **Reverse Engineering:** Het vermogen om een bestaand systeem te analyseren en door te ontwikkelen zonder uitgebreide documentatie.
- **Onderzoek Toepassen:** Ik kan onderzoek doen naar wetenschappelijke concepten en deze vertalen naar praktische goedkopere oplossingen (NDVI).
- **Opdrachtgever Communicatie:** Geleerd om proactief verwachtingen te managen en structuur aan te brengen in momenten waarop de vereisten of planning onduidelijk waren.

<div style="width: 100%; aspect-ratio: 16 / 9;">
 <iframe width="100%" height="100%" src="https://www.youtube.com/embed/qA3IbLCrv7I?si=qUJpCn7GHYB-4ytg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="display: block; border: 0;"></iframe>
</div>
