#!/bin/bash

if [[ -n "${HLINK_HOME}" ]]; then
    if [[ "$(stat -c '%u' ${HLINK_HOME})" != "${PUID}" ]] || [[ "$(stat -c '%g' ${HLINK_HOME})" != "${PGID}" ]]; then
        chown ${PUID}:${PGID} \
            ${HLINK_HOME}
    fi
fi

umask ${UMASK}

exec su-exec ${PUID}:${PGID} hlink start