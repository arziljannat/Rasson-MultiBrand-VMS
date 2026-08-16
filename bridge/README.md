# Rasson MultiBrand VMS Bridge

The bridge runs at each DVR location.

Its job is to:

1. Connect to local DVRs.
2. Read RTSP streams.
3. Convert/relay streams.
4. Send stream information to the central Rasson MultiBrand VMS.
5. Allow DVRs from different locations and networks to be viewed from one central dashboard.

Supported brands will include:

- Hikvision
- Dahua
- XMEye / XM
- Uniview
- ONVIF compatible DVRs

## Configuration

Edit:

bridge/config.json

Example:

```json
{
  "bridgeName": "Rasson3-Bridge",
  "centralServer": "http://localhost:3000",
  "devices": [
    {
      "id": "rasson3-hikvision",
      "name": "Rasson 3 - Hikvision DVR",
      "brand": "Hikvision",
      "host": "192.168.100.157",
      "port": 554,
      "username": "admin",
      "password": "YOUR_DVR_PASSWORD"
    }
  ]
}
