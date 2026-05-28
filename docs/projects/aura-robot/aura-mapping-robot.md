# Aura - Autonome LiDAR Robot - 09-2024 t/m 02-2025

**Mijn Rol:** Lead C++ / SLAM Engineer

*Aura was een proof-of-concept voor een autonome beveiligingsrobot in een magazijnomgeving, ontworpen om zelfstandig te navigeren, de omgeving in kaart te brengen en klimaat-/luchtkwaliteitsdata te verzamelen.*

Aura was een semester-3 project waarin mijn team en ik een proof-of-concept bouwden voor een autonome patrouillerende robot in een magazijnomgeving. De robot combineerde LiDAR-gebaseerde navigatie met klimaatmonitoring (temperatuur, luchtvochtigheid en TVOC) en moest zelfstandig een onbekende omgeving in kaart kunnen brengen.

[![Aura Hero Shot](aura_hero_shot.png)](https://youtu.be/T0WJigca8sU)

*Een hero shot van de AURA robot, in een professioneel magazijn om de commerciële toepassing en productvisie van het project te tonen.*

Maar voordat dat allemaal mogelijk was, moest de robot eerst een groot probleem van autonomie oplossen: hoe kan een machine navigeren in een onbekende omgeving? Onze hardware, een Kobuki Rover, had drivers die niet compatibel waren met de standaard ROS-oplossingen. Dit betekende dat ik de uitdaging en mogelijkheid had om een eigen oplossing te ontwerpen en implementeren. Ik besloot om vanaf de basis een SLAM-algoritme (Simultaneous Localization and Mapping) in C++ te bouwen, waarmee ik een functioneel GraphSLAM-systeem creëerde dat live LiDAR-data kon verwerken op een resource-beperkte Raspberry Pi.

## Technische inzichten & belangrijkste resultaten

Het traject zat vol uitdagingen, vooral op het gebied van kaartvervorming en rotatiefouten. De succesvolle kaart was een combinatie van een zorgvuldige algoritmekeuze en een belangrijk inzicht over initiële schattingen.

### De GraphSLAM Architectuur

Ik implementeerde een GraphSLAM-systeem met GICP (Generalized Iterative Closest Point) om opeenvolgende LiDAR-scans met elkaar te matchen. Wanneer de robot meer dan 15 cm had gereden, werd er een nieuw “keyframe” toegevoegd aan een graph-structuur. Wanneer een loop-closure werd gedetecteerd, dus het herkennen van een eerder bezochte locatie, werd Google’s Ceres Solver gebruikt om de volledige graph te optimaliseren. Hiermee werd opgebouwde drift gecorrigeerd en werd de kaart teruggetrokken naar een consistente vorm.

### Het belang van de initiële schatting

Het ICP-algoritme kan gemakkelijk vastlopen in een “lokaal minimum”, waardoor het een goede, maar niet perfecte uitlijning produceert. Ik realiseerde me dat de manier om dit te voorkomen lag in het meegeven van een sterke initiële schatting. Door de odometrie-data van de wielen te gebruiken om de positie van de robot tussen scans te schatten, kon ik deze schatting doorgeven aan het GICP-algoritme. Dit verbeterde de nauwkeurigheid van de uitlijning drastisch en was de doorbraak die leidde tot de eerste duidelijke kaart, waarmee een praktische toepassing van sensorfusie werd aangetoond.

Dit project combineerde meerdere onderdelen van robotica en softwareontwikkeling:

- **Custom algoritme:** Ik ontwierp en implementeerde een GraphSLAM-algoritme vanaf de basis in C++.
- **Embedded Linux:** De volledige softwarestack draaide en werd getest op een Raspberry Pi met Linux.
- **Productvisie & communicatie:** Ik maakte het storyboard, schreef het script en produceerde de promotievideo om de visie van het project duidelijk over te brengen.
- **Technische documentatie:** Ik documenteerde de `GraphSlamModule` uitgebreid als technische deep dive. Lees de [GraphSLAM Module Deep Dive](graphslammodule.md) voor een gedetailleerde uitleg van de implementatie en de uitdagingen die ik tegenkwam.

## Analyse van het Resultaat

De echte test voor het algoritme was de prestatie in een rommelige, realistische omgeving. De afbeelding hieronder is een ruwe point cloud die tijdens een succesvolle run in mijn woonkamer werd gegenereerd door mijn custom C++ SLAM-algoritme.

![Door AURA gegenereerde point cloud kaart](aura_pointcloud.png)

*De uiteindelijke kaart die door de robot is gegenereerd, met duidelijke contouren van de omgeving.*

Zoals te zien is aan mijn annotaties, wist het algoritme succesvol om te gaan met een reeks veelvoorkomende maar lastige uitdagingen voor LiDAR-gebaseerde SLAM:

- Het algoritme herkende de strakke geometrie van een duidelijk gedefinieerde hoek, die als sterk ankerpunt voor de kaart diende.
- Het kon omgaan met een gebied met veel rommelige objecten, zoals tafel- en stoelpoten zonder de positie kwijt te raken, wat robuustheid tegen ruis in de data aantoont.
- Het legde zelfs data vast van een gang die zichtbaar was door een glazen deur, een berucht lastig scenario door de transparantie en reflectiviteit van het oppervlak.

Dit resultaat valideerde de functionaliteit van de GICP- en GraphSLAM-implementatie in een uitdagende omgeving. Ik vond het heel erg leuk om die kaart eindelijk te zien na maanden onderzoek.

Aan het einde van het project implementeerde een teamgenoot een pathfinding-algoritme dat gebruikmaakte van de gegenereerde kaart. Hierdoor kon de robot autonoom naar een doel binnen een klaslokaal navigeren. Dit demonstreerde mooi hoe de SLAM-oplossing als basis diende voor praktische autonomie.

### Gebruikte technologieën

`C++` `CMake` `SLAM` `LiDAR` `Ceres Solver` `PCL` `Linux (Ubuntu)` `Raspberry Pi`
