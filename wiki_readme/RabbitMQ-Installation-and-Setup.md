## RabbitMQ Installation and Setup

This document details the process of installing and setting up RabbitMQ on a remote server, enabling its use as a message broker for the NestJS application.

**Server Requirements:**

- Ubuntu or a compatible Linux distribution
- Root or sudo access
- Stable internet connection

### Installation Steps:

1. **Update System Packages:**

   ```bash
   sudo apt-get update -y
   ```

2. **Install Prerequisite Packages:**

   ```bash
   sudo apt-get install curl gnupg apt-transport-https -y
   ```

   - **curl:** Used to download files from the internet.
   - **gnupg:** Used for verifying package signatures.
   - **apt-transport-https:** Enables HTTPS support for APT package manager.

3. **Import Signing Keys:**

   ```bash
   ## Team RabbitMQ's main signing key
   curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null

   ## Community mirror of Cloudsmith: modern Erlang repository
   curl -1sLf https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-erlang.E495BB49CC4BBE5B.key | sudo gpg --dearmor | sudo tee /usr/share/keyrings/rabbitmq.E495BB49CC4BBE5B.gpg > /dev/null

   ## Community mirror of Cloudsmith: RabbitMQ repository
   curl -1sLf https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-server.9F4587F226208342.key | sudo gpg --dearmor | sudo tee /usr/share/keyrings/rabbitmq.9F4587F226208342.gpg > /dev/null
   ```

   - This step imports the necessary GPG keys for verifying the authenticity of the RabbitMQ and Erlang packages.

4. **Add RabbitMQ Repositories:**

   ```bash
   sudo tee /etc/apt/sources.list.d/rabbitmq.list <<EOF
   ## Provides modern Erlang/OTP releases
   ##
   deb [arch=amd64 signed-by=/usr/share/keyrings/rabbitmq.E495BB49CC4BBE5B.gpg] https://ppa1.novemberain.com/rabbitmq/rabbitmq-erlang/deb/ubuntu jammy main
   deb-src [signed-by=/usr/share/keyrings/rabbitmq.E495BB49CC4BBE5B.gpg] https://ppa1.novemberain.com/rabbitmq/rabbitmq-erlang/deb/ubuntu jammy main

   # another mirror for redundancy
   deb [arch=amd64 signed-by=/usr/share/keyrings/rabbitmq.E495BB49CC4BBE5B.gpg] https://ppa2.novemberain.com/rabbitmq/rabbitmq-erlang/deb/ubuntu jammy main
   deb-src [signed-by=/usr/share/keyrings/rabbitmq.E495BB49CC4BBE5B.gpg] https://ppa2.novemberain.com/rabbitmq/rabbitmq-erlang/deb/ubuntu jammy main

   ## Provides RabbitMQ
   ##
   deb [arch=amd64 signed-by=/usr/share/keyrings/rabbitmq.9F4587F226208342.gpg] https://ppa1.novemberain.com/rabbitmq/rabbitmq-server/deb/ubuntu jammy main
   deb-src [signed-by=/usr/share/keyrings/rabbitmq.9F4587F226208342.gpg] https://ppa1.novemberain.com/rabbitmq/rabbitmq-server/deb/ubuntu jammy main

   # another mirror for redundancy
   deb [arch=amd64 signed-by=/usr/share/keyrings/rabbitmq.9F4587F226208342.gpg] https://ppa2.novemberain.com/rabbitmq/rabbitmq-server/deb/ubuntu jammy main
   deb-src [signed-by=/usr/share/keyrings/rabbitmq.9F4587F226208342.gpg] https://ppa2.novemberain.com/rabbitmq/rabbitmq-server/deb/ubuntu jammy main
   EOF
   ```

   - Adds the official RabbitMQ and Erlang repositories to the system's package list.

5. **Update Package Lists Again:**

   ```bash
   sudo apt-get update -y
   ```

   - Refreshes the package lists to include packages from the newly added repositories.

6. **Install Erlang:**

   ```bash
   sudo apt-get install -y erlang-base \
                           erlang-asn1 erlang-crypto erlang-eldap erlang-ftp erlang-inets \
                           erlang-mnesia erlang-os-mon erlang-parsetools erlang-public-key \
                           erlang-runtime-tools erlang-snmp erlang-ssl \
                           erlang-syntax-tools erlang-tftp erlang-tools erlang-xmerl
   ```

   - Installs the necessary Erlang/OTP (Open Telecom Platform) packages required to run RabbitMQ.

7. **Install RabbitMQ Server:**
   ```bash
   sudo apt-get install rabbitmq-server -y --fix-missing
   ```
   - Installs the RabbitMQ server package. The `--fix-missing` flag resolves any dependency issues during installation.

### Verification:

After installation, verify RabbitMQ's status:

```bash
sudo systemctl status rabbitmq-server
```

You should see output indicating that the service is active (running).

### Configuration and Management:

- **Enable RabbitMQ Management Plugin:**

  ```bash
  sudo rabbitmq-plugins enable rabbitmq_management
  ```

  - Enables the management plugin, providing a web-based UI for managing and monitoring RabbitMQ.

- **Access the Management UI:**

  - Navigate to `http://176.123.2.210:15672` in your web browser.
  - Use the default credentials (`guest`/`guest`) to log in (**change these credentials for production!**).

- **Further Configuration:**
  - Refer to the official RabbitMQ documentation for advanced configuration options, including user management, virtual host creation, and security settings: [https://www.rabbitmq.com/documentation.html](https://www.rabbitmq.com/documentation.html).

This installation guide sets up RabbitMQ on your remote server. You can now configure it and integrate it with your NestJS application for efficient and reliable message queuing.
