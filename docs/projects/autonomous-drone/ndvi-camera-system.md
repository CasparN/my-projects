# NDVI Dual-Camera Prototype

!!! note "Technische documentatie"
    Dit document beschrijft het dual-camera prototype voor de Autonomous Vineyard Drone. Het is originele projectdocumentatie over de Raspberry Pi camera modules en de live streaming server.

## Doel

Voor de wijngaarddrone wilde ik een goedkope basis bouwen voor plantgezondheidsmonitoring. Commerciële NDVI-camera's zijn duur, dus ik onderzocht of een Raspberry Pi met twee camera's een bruikbaar prototype kon vormen:

- een standaard RGB-camera voor normale beeldvorming en piloot-/inspectiebeeld;
- een NoIR-camera met blauwfilter voor een NDVI-achtige verwerking.

Het doel was niet om direct een wetenschappelijk gevalideerde NDVI-oplossing te leveren, maar om te bewijzen dat een low-cost camerasysteem live RGB- en vegetatiebeelden kon leveren vanaf de drone.

## Hardware-opzet

De camera-opzet bestond uit twee Raspberry Pi camera modules op een Raspberry Pi 5:

- **RGB-camera:** normale zichtbare beelden voor inspectie, documentatie en live video.
- **NoIR-camera:** camera zonder infraroodfilter, geschikt om near-infrared licht vast te leggen.
- **Blauwfilter:** gebruikt op de NoIR-camera om een betere scheiding tussen zichtbare en near-infrared componenten te krijgen.
- **3D-geprinte behuizing:** ontworpen om beide camera's op de drone te monteren.

De NoIR-camera is gevoeliger voor infrarood licht, waardoor beelden in daglicht vaak roze of magenta lijken. Dat is normaal gedrag voor dit type module en moest meegenomen worden in exposure-instellingen en interpretatie.

## Camera capture

Voor beide camera's gebruikte ik `Picamera2` op de Raspberry Pi 5. De camera's konden hoge-resolutiebeelden vastleggen, bijvoorbeeld 3280x2464 pixels.

Voor de NoIR-camera was focus en belichting belangrijker dan bij de RGB-camera. De lens moest handmatig scherpgesteld worden en de automatische belichting moest soms worden bijgestuurd met exposure compensation, bijvoorbeeld:

```python
picam2.set_controls({"ExposureValue": -2.0})
```

Voor inspectiebeelden werden foto's als PNG opgeslagen om zoveel mogelijk detail te bewaren. Bestandsnamen kregen een timestamp, zodat vluchtbeelden later te koppelen waren aan de test.

## Live dual-camera streaming

Naast losse foto's werkte ik aan een live dual-camera server. Die had twee gescheiden pipelines:

### RGB-stream

De RGB-camera werd gekoppeld aan de hardware JPEG encoder van de Raspberry Pi. De encoder schreef volledige JPEG-frames naar een in-memory buffer. Een Flask endpoint (`/video_rgb`) kon die frames vervolgens als MJPEG-stream tonen.

Het voordeel hiervan is dat de CPU nauwelijks belast wordt door het comprimeren van de RGB-video. Daardoor bleef de normale videofeed snel en met lage latency.

### NDVI-snapshot

De NoIR-camera werd anders behandeld. Een aparte background thread nam periodiek een raw image array op met `capture_array()`. Die array werd verwerkt met Python en OpenCV:

1. beeld ophalen van de NoIR-camera;
2. contrast stretching toepassen;
3. NDVI-achtige waarde berekenen;
4. false-color mapping toepassen;
5. laatste verwerkte frame in een queue plaatsen.

Een tweede endpoint (`/ndvi_snapshot`) gaf steeds de nieuwste verwerkte NDVI-afbeelding terug.

Deze scheiding was belangrijk: de RGB-stream bleef soepel, terwijl de zwaardere NDVI-bewerking op een lagere frequentie kon draaien.

## NDVI-verwerking

NDVI staat voor Normalized Difference Vegetation Index. Het idee is dat gezonde planten zichtbaar rood licht en nabij-infrarood licht anders reflecteert. De basisformule is:

```text
NDVI = (NIR - Red) / (NIR + Red)
```

Bij een goedkope NoIR-camera met blauwfilter is dit een benadering. De kanalen komen niet perfect overeen met professionele multispectrale camera's. Daarom beschouw ik dit prototype als een demonstratie en technische basis, niet als gevalideerd meetinstrument.

## Integratie met een webapp

De eerste server was een groot bestand: camera capture, beeldverwerking en webserver in één Python/Flask-script. Dat werkte goed voor lokale tests, maar is niet ideaal voor een externe webapp.

Een betere vervolgstap zou zijn om de camera-app als WebSocket-client te laten draaien op de drone. De drone stuurt dan RGB- en NDVI-frames naar een Express-server, die ze doorstuurt naar browserclients. De frontend kan vervolgens twee `<img>`-elementen bijwerken: één voor RGB en één voor NDVI.

Die architectuur zou de verantwoordelijkheden beter scheiden:

- de drone verwerkt en verstuurt frames;
- de server fungeert als broker;
- de webapp toont beeld en stuurt commando's terug.

## Beperkingen

Het prototype had een paar duidelijke beperkingen:

- De NDVI-benadering is niet gevalideerd met echte wijnstokken.
- De NoIR + blauwfilter-opzet is geen vervanging voor een professionele multispectrale camera.
- Realtime NDVI-verwerking vereist CPU-tijd, dus framerate en resolutie moeten bewust gekozen worden.
- Camera-exposure, focus en montage hebben veel invloed op de kwaliteit van de data.
- Buiten vliegen vereist een beschermende behuizing en stabiele voeding voor de Raspberry Pi.

## Resultaat

Het dual-camera prototype liet zien dat ik normale RGB-beelden en NDVI-achtige beelden uit twee Raspberry Pi camera's kon halen en live kon tonen. Daarmee ontstond een praktische basis voor verdere plantgezondheidsmonitoring, ook al was er nog geen volledige validatie.
