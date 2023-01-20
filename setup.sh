#!/bin/bash

# Download links
CONTLINK="docker://cpllab/psiturk:latest"
# Path to put data
DATAPATH="psiturk/static/"
LINKHASH="6sk7j03bxu7teak2utr4ts3t1sh2ykdt"
DATALINK="https://yale.box.com/shared/static/${LINKHASH}.gz"

# DATALINK="https://yale.box.com/shared/static/eyu6jgppz6ek4a3vz63t9t1ipqit2q3m.gz"
ENVNAME="edp-behavior"


usage="$(basename "$0") [targets...] -- setup an environmental components of project
supported targets:
    cont : either pull the singularity container or build from scratch
    data : pull data
    env : create conda env from given file
"

[ $# -eq 0 ] || [[ "${@}" =~ "help" ]] && echo "$usage"

# container setup
[[ "${@}" =~ "cont" ]] || echo "Not touching container"
[[ "${@}" =~ "cont" ]] && echo "pulling container" && \
    apptainer pull "psiturk.sif" "$CONTLINK"

# datasets
[[ "${@}" =~ "data" ]] || [[ "${@}" =~ "data" ]] || echo "Not touching data"
[[ "${@}" =~ "data" ]] && echo "pulling data" && \
    wget "$DATALINK" -O "ecog_pilot_data.tar.gz" && \
    tar -xvzf "ecog_pilot_data.tar.gz" -C "$DATAPATH" && \
    rm "ecog_pilot_data.tar.gz"

# datasets
[[ "${@}" =~ "env" ]] || [[ "${@}" =~ "env" ]] || echo "Not touching conda env"
[[ "${@}" =~ "env" ]] && echo "creating env" && \
    conda env create -n "$ENVNAME" -f env.yml