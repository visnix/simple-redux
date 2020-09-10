

// 在闭包中存储了 currentSate、currentListeners 两个变量，并抛出读取和改变这两个变量的方法
export function createStore(reducer, enhancer){
	if (enhancer) {
		return enhancer(createStore)(reducer)
	}
	let currentState = {}
	let currentListeners = []

	function getState(){
		return currentState
	}
	function subscribe(listener){
		currentListeners.push(listener)
	}
	// dispatch 的作用就是更具action来更改(更改的规则就是reducer)createStore中的currentState闭包变量
	function dispatch(action){
		currentState = reducer(currentState, action)
		currentListeners.forEach(v=>v())
		return action
	}
	// 返回一个默认值
	dispatch({type:'@IMOOC/WONIU-REDUX'})
	return { getState, subscribe, dispatch}
}

export function applyMiddleware(...middlewares){
	return createStore=>(...args)=>{
		const store = createStore(...args)
		let dispatch = store.dispatch

		const midApi = {
			getState:store.getState,
			dispatch:(...args)=>dispatch(...args)
		}
		// 中间件最重要的就是接受两个方法
		const middlewareChain = middlewares.map(middleware=>middleware(midApi))
		// 覆盖掉原生的 dispatch
		dispatch = compose(...middlewareChain)(store.dispatch)
		// 中间件其实是三层签到函数，使用了柯里化
		// dispatch = middleware(midApi)(store.dispatch)
		 // middleware(midApi)(store.dispatch)(action)
		return {
			...store,
			dispatch
		}

	}
	// middlewares.map...	
}
// compose要做的事情就是柯里化，把一系列的函数变成嵌套的的形式依次调用
// compose(fn1,fn2,fn3)
// fn1(fn2(fn3))
export function compose(...funcs){
	// 如果参数是0，那么直接返回原来的函数
	if (funcs.length==0) {
		return arg=>arg
	}
	// 如果是一个参数，就不要搞链条了
	if (funcs.length==1) {
		return funcs[0]
	}
	return funcs.reduce((ret,item)=> (...args)=>ret(item(...args)))
}
// {addGun, removeGun, addGunAsync}
// addGun(参数)
// dispatch(addGun(参数))
function bindActionCreator(creator, dispatch){
	return (...args) => dispatch(creator(...args))
}
export function bindActionCreators(creators,dispatch){
	// let bound = {}
	// Object.keys(creators).forEach(v=>{
	// 	let creator = creators[v]
	// 	bound[v] = bindActionCreator(creator, dispatch)
	// })
	// return bound
	return Object.keys(creators).reduce((ret,item)=>{
		ret[item] = bindActionCreator(creators[item],dispatch)
		return ret
	},{})
}

