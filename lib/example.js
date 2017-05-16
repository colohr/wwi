
const express = require('express')



class Examples{
  constructor({publics,modules}){
    this.publics = publics
    this.modules = modules
    this.app = express()
    this.app.use('/',express.static(this.publics))
  }
  listen(port){
    this.port = port || '8888'
    return new Promise((success,error)=>{
      return this.app.listen(port,()=>{
        return success(this)
      })
    })
  }
  get url(){
    return `http://localhost:${this.port}`
  }

}


module.exports = run_app

function run_app(directories){
  return new Examples(directories)
}