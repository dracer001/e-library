const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')
const { v4: uuid} = require('uuid')
const { format } = require('date-fns')

const log_dir = './logs'

const logEvent = async (message, filename) => {
    const datetime = format(new Date(), 'yyyy/MM/dd HH:mm:ss')
    const log_msg = `${uuid()}, ${datetime}, \t${message}\n`
    const log_path = path.join(log_dir, filename)

    try{
        if(!fs.existsSync(log_dir)){
            await fsPromises.mkdir(log_dir)
        }
        await fsPromises.appendFile(log_path, log_msg)
    }catch(err){
        console.log(err)
    }
}


const logger = (req, res, next)=>{
    logEvent(`${req.method} ${req.url} ${req.headers['user-agent']}${req.ip} ${req.headers.origin}  `, 'reqLog.txt')
    next()
}


module.exports = {logEvent, logger}





 
// const logEvents = async (message, logName) => {
//     const datetime = format(new Date(), 'yyyy/MM/dd\t HH:mm:ss')
//     const logItem = `${datetime}\t${uuid()}\t${message}\n`
//     // console.log(datetime)
//     console.log(logItem)
//     try{
//         if(!fs.existsSync(path.join(__dirname, 'logs'))){
//             await fsPromises.mkdir(path.join(__dirname, 'logs'))
//         }
//         await fsPromises.appendFile(path.join(__dirname, 'logs', logName), logItem)

//     } catch (err){
//         console.log(err)
//     }
// }

// module.exports = logEvents
