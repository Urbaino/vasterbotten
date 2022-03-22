import StatusService from './services/statusDumpService'

new StatusService('/workspaces/vasterbotten/statusdumps/pending').ReadStatus().then(
    status => console.log(status)
)