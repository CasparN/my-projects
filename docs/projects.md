---
title: Projecten
---

# Projecten

Hier is een selectie van mijn beste werk.

## StratusDash - 04-2025 t/m heden

Slim, batterijgevoed weerstation met 7,5-inch e-paper dat binnenklimaat en externe weersverwachtingen toont. Het project waar ik het meest van heb geleerd van deze hele lijst.

- **Rol:** Product Engineer (full-stack, hardware en fabricage).
- **Probleem:** Een gebruiksvriendelijk, low-power dashboard moest maandenlang op batterijen draaien en toch echt inzetbaar blijven voor gebruikers.
- **Resultaat:** Zeven units als pilot-batch gebouwd en geleverd, met modulaire firmware, veilige pairing, OTA-updates, telemetry, een solide backend en een Nederlandse en Engelse website.
- **Techstack:** `Arduino` `ESP32` `FastAPI` `MariaDB` `E-Paper`.
- [Uitgebreide versie](projects/stratusdash/stratusdash.md)
- [Pairing Architectuur](projects/stratusdash/stratusdash-pairing.md)

## Coulomb Counter - Stage Alflex Technologies - 09-2025 t/m 02-2026

Ontwikkeling van een autonoom en betrouwbaar stroommeetsysteem voor het langdurig analyseren van ultra-low-power IoT-apparaten.

- **Rol:** Embedded Software Engineering-stagiair (embedded en backend)
- **Probleem:** Industriële energiemeters (zoals de Joulescope) vereisen een constante pc-verbinding en vertonen software-instabiliteit bij tests langer dan 12 uur. Alflex had behoefte aan een autonoom, embedded alternatief om verborgen stroomvretende-bugs in het veld te vinden.
- **Resultaat:** Een stabiele firmware-architectuur op basis van een non-blocking superloop. Data wordt via een zelfontworpen binair MQTT-protocol naar een backend in Docker-containers (InfluxDB + MariaDB) gepusht. In offlinemodus buffert het apparaat tot minimaal twee maanden aan data op een ruwe flash-partitie met oog op wear-leveling. In onlinemodus wordt PSRAM gebruikt om deze data te bufferen.
- **Techstack:** `C (ESP-IDF)` `ATtiny1616` `ESP32-S3` `MQTT (Mosquitto)` `Python` `InfluxDB` `MariaDB` `Grafana`.
- [Uitgebreide versie](projects/coulombcounter/alflex-coulomb-counter.md)

## Defensie: Versterken en Verstoren - Dark Tech Studio - 03-2026 t/m 06-2026

Een event-driven akoestische sensor voor het detecteren en classificeren van militaire dreigingen (zoals schoten en voertuigen) via YAMNet.

- **Rol:** Creative Technologist - firmware en security-analyse
- **Probleem:** Het team had een werkend prototype voor geluidsclassificatie, maar de architectuur was onveilig voor tactisch gebruik (gevoelig voor Man-in-the-Middle aanvallen en elektronische oorlogsvoering) en lokaal geïsoleerd.
- **Resultaat:** De firmware-architectuur modulair en event-driven gemaakt (zendt alleen bij overschrijding van een geluidsdrempel). De backend veilig publiek toegankelijk gemaakt via Cloudflare-tunnels op een Raspberry Pi. Daarnaast een threat model opgeleverd waaruit bleek waarom edge-AI en een verbindingstechnologie zoals LoRa relevante vervolgrichtingen waren voor de overlevingskans van de sensor in het veld.
- **Techstack:** `ESP32 (I2S)` `Cloudflare Tunnels` `Security Architecture` `IoT Threat Modeling` `YAMNet/Python (Team stack)`.
- [Uitgebreide versie](projects/defensie-versterken-verstoren/project.md)

## Autonomous Vineyard Drone - SAW Aero - 03-2025 t/m 06-2025

Autonome drone voor wijngaardmonitoring die een route kan vliegen en NDVI-data verzamelt via een low-cost camera-oplossing.

- **Rol:** Drone Pilot & NDVI Sensor Engineer, ArduPilot/MissionPlanner Configurator.
- **Probleem:** Het project startte met beperkte documentatie en een overgenomen prototype, waardoor veel reverse engineering nodig was.
- **Resultaat:** Een autonoom vliegende drone met NDVI-prototype, live RGB/NDVI-visualisatie en een praktische basis voor irrigatiemonitoring.
- **Techstack:** `Python` `OpenCV` `Raspberry Pi NoIR` `ArduPilot`.
- [Uitgebreide versie](projects/autonomous-drone/autonomous-vineyard-drone.md)

## AURA - Autonome LiDAR Robot - 09-2024 t/m 02-2025

Autonome beveiligingsrobot voor een magazijnomgeving met kaartopbouw, navigatie en klimaat-/luchtkwaliteitsmeting. Het project waar ik vanaf de basis een GraphSLAM-oplossing in C++ bouwde.

- **Rol:** Verantwoordelijk voor C++ en SLAM
- **Probleem:** De Kobuki Rover had geen bruikbare ROS-drivers, dus ik moest een eigen oplossing bouwen om LiDAR-scans en odometrie te combineren voor navigatie in een onbekende omgeving.
- **Resultaat:** Een werkend GraphSLAM-systeem met GICP en Ceres Solver dat live LiDAR-data verwerkte, drift corrigeerde via loop closures en een bruikbare kaart opleverde.
- **Techstack:** `C++` `CMake` `SLAM` `LiDAR` `Ceres Solver` `PCL` `Linux (Ubuntu)` `Raspberry Pi`.
- [Uitgebreide versie](projects/aura-robot/aura-mapping-robot.md)
- [GraphSLAM Deep Dive](projects/aura-robot/graphslammodule.md)
