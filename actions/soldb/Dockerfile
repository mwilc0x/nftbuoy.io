FROM node:14-slim as action-soldb

ARG RUNNER_VERSION="2.291.1"

ENV ACTIONS_RUNNER_HOOK_JOB_COMPLETED=/completed.sh

# update the base packages and add a non-sudo user
RUN apt-get update -y && apt-get upgrade -y && useradd -m mike

# install python and the packages the your code depends on along with jq so we can parse JSON
# add additional packages as necessary
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    curl jq ca-certificates keychain acl vim

# cd into the user directory, download and unzip the github actions runner
RUN cd /home/mike && mkdir actions-runner && cd actions-runner \
    && curl -O -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz \
    && tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# install some additional dependencies
RUN chown -R mike ~mike && /home/mike/actions-runner/bin/installdependencies.sh

# copy over the start.sh script
COPY start.sh start.sh

# copy over the completed.sh script
COPY completed.sh completed.sh
RUN mkdir actions-completed
COPY package.json /actions-completed
COPY go.js /actions-completed
RUN chown -R mike:mike /actions-completed
RUN chmod 755 /actions-completed

# make the script executable
RUN chmod +x completed.sh

# make the script executable
RUN chmod +x start.sh

# since the config and run script for actions are not allowed to be run by root,
# set the user to "docker" so all subsequent commands are run as the docker user
USER mike

# set the entrypoint to the start.sh script
ENTRYPOINT ["./start.sh"]
