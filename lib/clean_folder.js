const console = require('better-console')
const fxy = require('fxy')

module.exports = clean_directory

function clean_directory(directory,logs){
	let removed_files = remove_all_files(directory)
	
	
	if(has_error(removed_files)) {
		console.error(removed_files)
		throw new Error(`Error when removing files in ${directory}`)
	}
	//console.info('removed files')
	//console.table(get_visible_items(removed_files))
	let removed_folders = remove_all_folders(directory)
	
	
	if(has_error(removed_folders)) {
		console.error(removed_folders)
		throw new Error(`Error when removing folders in ${directory}`)
	}
	
	if(remove_ds_store(directory)) fxy.rmdirSync(directory)
	
	if(logs !== false){
		console.error('\n***********************')
		console.error('Removed directory: ',directory)
		console.error('Removed folders:')
		console.table(get_visible_items(removed_folders))
		console.error('***********************\n')
	}
	
	
	return true
}

function get_folders_of_item(item,onlys){
	let items = item.items
	if(items.length > 0){
		//console.info(item.name,'has items')
		for(let child_item of items){
			if(child_item.get('type').directory){
				//console.warn(child_item.name,'is directory')
				onlys.push(child_item)
				get_folders_of_item(child_item,onlys)
			}
		}
	}
	return onlys
}

function get_visible_items(items){
	return items.map(item=>{
		let visible_item = {}
		visible_item.name = item.name
		visible_item.path = item.get('path')
		visible_item.type = item.get('type').file ? 'file':'folder'
		return visible_item
	})
}

function has_error(list){ return list.filter(item=>{ return item instanceof Error }).length > 0 }

function remove_all_files(directory){
	let tree = fxy.tree(directory)
	let files = tree.items.only
	return files.map(item=>{
		let file_path = item.get('path')
		try{
			fxy.unlinkSync(file_path)
			item.was_deleted = 'yes'
			return item
		}catch(e){
			return e
		}
	})
}

function remove_all_folders(directory){
	let tree = fxy.tree(directory)
	let items = tree.items
	var folders = []
	for(let item of items){
		let item_folders = get_folders_of_item(item,[])
		if(item.get('type').directory) folders.push(item)
		folders = folders.concat(item_folders)
	}
	return folders.sort(sort_items_by_folder_depth).map(item=>{
		let item_path = item.get('path')
		//console.warn('removing path',item_path)
		try{
			if(remove_ds_store(item_path)) fxy.rmdirSync(item_path)
			return item
		}catch(e){
			return e
		}
	})
}

function remove_ds_store(folder){
	let ds_store_path = fxy.join(folder,'.DS_Store')
	//console.log(ds_store_path,' exits ', fxy.exists(ds_store_path))
	if(fxy.exists(ds_store_path)) fxy.unlinkSync(ds_store_path)
	return true
}

function sort_items_by_folder_depth(A,B){
	let a = A.get('path').split('/')
	let b = B.get('path').split('/')
	if(a.length > b.length) return -1
	else if(a.length < b.length) return 1
	return 0
}