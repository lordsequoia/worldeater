const path = require('path')
const os = require('os')
const fs = require('fs')

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true})
    }

    return dir
}

const rootDir = ensureDir(process.env.ROOT_DIR || path.resolve(path.join(os.homedir(), '.worldeater')))
const versionId = process.env.VERSION_ID || '1.18'
const javaVersion = process.env.JAVA_VERSION || '17'
const projectId = process.env.PROJECT_ID || 'default-' + versionId + '-' + javaVersion
const projectsDir = ensureDir(path.join(rootDir, 'projects'))
const projectDir = ensureDir(path.join(projectsDir, projectId))

// replace with reactive value in server.properties for 'level-name'
const levelName = process.env.LEVEL_NAME || null

const allConfig = {
    rootDir,
    versionId,
    javaVersion,
    projectId,
    projectsDir,
    projectDir,
    levelName,
}

module.exports = {
    rootDir: projectDir,
    levelName: levelName,
    socketHost: process.env.SOCKET_HOST || '0.0.0.0',
    socketPort: process.env.SOCKET_PORT || 3082
}