import { ReadStatus } from './services/statusDumpService'

ReadStatus('/workspaces/vasterbotten/statusdumps/pending').then(
    status => console.log(status)
)