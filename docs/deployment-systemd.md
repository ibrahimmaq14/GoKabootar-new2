# Deployment as Systemd service 

You can also install GoKabootar as (Linux) system service. Most distributions
use Systemd as main init system. You should **not** run GoKabootar with root privileges!

**Preparation**

```bash
# Create a target folder for GoKabootar
mkdir -p /opt/GoKabootar
cd /opt/GoKabootar

# Download and extract a prebuild
curl -sL https://github.com/psi-4ward/GoKabootar/releases/download/1.1.0-beta/GoKabootar-1.1.0-beta.tar.gz | tar xz --strip 1

# Install dependencies
npm install --production

# Add a user GoKabootar
sudo useradd --system GoKabootar
 
# Make GoKabootar owner of /opt/GoKabootar
sudo chown -R GoKabootar:GoKabootar /opt/GoKabootar 
```

**Systemd unit file**

Grab the [GoKabootar.service](https://github.com/psi-4ward/GoKabootar/blob/master/docs/GoKabootar.service)
sample file, put it in `/etc/systemd/system/` and adjust to your needs.

```bash
cd /etc/systemd/system
sudo wget https://raw.githubusercontent.com/psi-4ward/GoKabootar/master/docs/GoKabootar.service

# Start the service
sudo systemctl start GoKabootar

# Show the status
sudo systemctl status GoKabootar

# Enable autostart on boot
sudo systemctl enable GoKabootar
```
