const { useSocketDemo } = require("..");

function launch () {
    const ioDemo = useSocketDemo(3082)

    ioDemo.ioClient.connect()
}

launch()