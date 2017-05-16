const fxy = require('fxy')
const wwi = fxy.join(__dirname,'../wwi')
const mkdirp = require('mkdirp')


module.exports = install_wwi




function create_modules_folder(modules_directory){
  return new Promise((success,error)=>{
    return fxy.mkdir(modules_directory).then(()=>{
      return success(modules_directory)
    })
  })
}



function get_modules(public_directory){
  return new Promise((success,error)=>{
    let modules_directory = fxy.join(public_directory,'modules')
    if(!fxy.exists(modules_directory)) return create_modules_folder(modules_directory)
    return success(modules_directory)
  })
}



function get_wwi_copy(modules_directory){
  return new Promise((success,error)=>{
    let wwi_directory = fxy.join(modules_directory,'wwi')
    console.log(wwi_directory)
    if(!fxy.exists(wwi_directory)){
      return fxy.copy_dir(wwi,wwi_directory).then(copier=>{
        console.log('wwi installed at ',wwi_directory)
        return success(modules_directory)
      }).catch(error)
    }
    else return success(modules_directory)
  })
}



function install_wwi(directory){
  console.log('wwi directory: ',directory)
  if(fxy.exists(directory)){
    return get_modules(directory).then(modules_directory=>{
      return get_wwi_copy(modules_directory)
    })
  }
  throw new Error(`${directory} for modules does not exist.`)
}


