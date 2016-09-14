window.onload = function() {
	init()
}

function init() {
	var c = document.getElementById('canvas');
	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');  

	gl.clearColor(0, 0, 0, 1.0); 
	gl.clearDepth(1.0)  //深度
	gl.clear(gl.COLOR_BUFFER_BIT);

	//穿件着色器
	function create_shader(id){  
	    // 用来保存着色器的变量  
	    var shader;  
	      
	    // 根据id从HTML中获取指定的script标签  
	    var scriptElement = document.getElementById(id);  
	      
	    // 如果指定的script标签不存在，则返回  
	    if(!scriptElement){return;}  
	      
	    // 判断script标签的type属性  
	    switch(scriptElement.type){  
	          
	        // 顶点着色器的时候  
	        case 'x-shader/x-vertex':  
	            shader = gl.createShader(gl.VERTEX_SHADER);  
	            break;  
	              
	        // 片段着色器的时候  
	        case 'x-shader/x-fragment':  
	            shader = gl.createShader(gl.FRAGMENT_SHADER);  
	            break;  
	        default :  
	            return;  
	    }  
	      
	    // 将标签中的代码分配给生成的着色器  
	    gl.shaderSource(shader, scriptElement.text);  
	      
	    // 编译着色器  
	    gl.compileShader(shader);  
	      
	    // 判断一下着色器是否编译成功  
	    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){  
	          
	        // 编译成功，则返回着色器  
	        return shader;  
	    }else{  
	          
	        // 编译失败，弹出错误消息  
	        alert(gl.getShaderInfoLog(shader));  
	    }  
	}  
	//连接着色器,生成程序
	function create_program(vs, fs){  
	    // 程序对象的生成  
	    var program = gl.createProgram();  
	      
	    // 向程序对象里分配着色器  
	    gl.attachShader(program, vs);  
	    gl.attachShader(program, fs);  
	      
	    // 将着色器连接  
	    gl.linkProgram(program);  
	      
	    // 判断着色器的连接是否成功  
	    if(gl.getProgramParameter(program, gl.LINK_STATUS)){  
	      
	        // 成功的话，将程序对象设置为有效  
	        gl.useProgram(program);  
	          
	        // 返回程序对象  
	        return program;  
	    }else{  
	          
	        // 如果失败，弹出错误信息  
	        alert(gl.getProgramInfoLog(program));  
	    }  
	}  
	//根据模型创建好vbo
	function create_vbo(data){  
	    // 生成缓存对象  
	    var vbo = gl.createBuffer();  
	      
	    // 绑定缓存  
	    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);  
	      
	    // 向缓存中写入数据  
	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);  
	      
	    // 将绑定的缓存设为无效  
	    gl.bindBuffer(gl.ARRAY_BUFFER, null);  
	      
	    // 返回生成的VBO  
	    return vbo;  
	}  

	var vertex_position = [   //模型
	    // X,   Y,   Z  
	     0.0, 1.0, 0.0,  
	     1.0, 0.0, 0.0,  
	    -1.0, 0.0, 0.0  
	];

	// 保存顶点的颜色情报的数组  
	var vertex_color = [  
	    1.0, 0.0, 0.0, 1.0,  
	    0.0, 1.0, 0.0, 1.0,  
	    0.0, 1.0, 0.0, 1.0  
	]; 

	// 顶点着色器和片段着色器的生成  
    var v_shader = create_shader('vs');  
    var f_shader = create_shader('fs'); 

    // 程序对象的生成和连接  
    var prg = create_program(v_shader, f_shader); 

    // attributeLocation的获取  
    var attLocation = new Array(2);
    attLocation[0] = gl.getAttribLocation(prg, 'position');  
    attLocation[1] = gl.getAttribLocation(prg, 'color');  
      
    // attribute的元素数量(这次只使用 xyz ，所以是3)  
    var attStride = new Array(2);
    attStride[0] = 3;
    attStride[1] = 4;

    // 生成VBO  
    var position_vbo = create_vbo(vertex_position); 
    // 绑定VBO  
    gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo);  
    // 设定attribute属性有効  
    gl.enableVertexAttribArray(attLocation[0]);  
    // 添加attribute属性  
    gl.vertexAttribPointer(attLocation[0], attStride[0], gl.FLOAT, false, 0, 0);  


    // 生成colorVBO  
    var color_vbo = create_vbo(vertex_color); 
    // 绑定VBO  
    gl.bindBuffer(gl.ARRAY_BUFFER, color_vbo);  
    // 设定attribute属性有効  
    gl.enableVertexAttribArray(attLocation[1]);  
    // 添加attribute属性  
    gl.vertexAttribPointer(attLocation[1], attStride[1], gl.FLOAT, false, 0, 0);

    // uniformLocation的获取  
    var uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');

	// 生成matIV对象  
	var m = new matIV();  	  

	// 矩阵初始化  
	var mMatrix = m.identity(m.create());   // 模型变换矩阵  
	var vMatrix = m.identity(m.create());   // 视图变换矩阵  
	var pMatrix = m.identity(m.create());   // 投影变换矩阵  
	var tmpMatrix = m.identity(m.create()); // 临时坐标变换矩阵
	var mvpMatrix = m.identity(m.create()); // 最终的坐标变换矩阵  
	  
	// 视图变换坐标矩阵  
    m.lookAt([0.0, 1.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);// 投影坐标变换矩阵  
	m.multiply(pMatrix, vMatrix, tmpMatrix); // p和v相乘,临时存储
	
	// //移动第一个模型的位置
	// m.translate(mMatrix, [1.5, 0.0, 0.0], mMatrix);
	// m.multiply(tmpMatrix, mMatrix, mvpMatrix);

 //    // 向uniformLocation中传入坐标变换矩阵  
 //    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);  
 //    // 绘制模型  
 //    gl.drawArrays(gl.TRIANGLES, 0, 3); 

 //    m.identity(mMatrix);
 //    m.translate(mMatrix, [-1.5, 0.0, 0.0], mMatrix);
	// m.multiply(tmpMatrix, mMatrix, mvpMatrix);

	// // 向uniformLocation中传入坐标变换矩阵  
 //    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);  
 //    // 绘制模型  
 //    gl.drawArrays(gl.TRIANGLES, 0, 3);
 
 //    // context的刷新  
 //    gl.flush();  
 	var count = 0; 
    (function(){  
	    // canvasを初期化  
	    gl.clearColor(0.0, 0.0, 0.0, 1.0);  
	    gl.clearDepth(1.0);  
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
	      
	    // 计数器递增  
	    count++;  
	      
	    // 使用计数器算出角度  
	    var rad = (count % 360) * Math.PI / 180;  
	      
	    // 模型1按照一个圆形轨道进行旋转  
	    var x = Math.cos(rad);  
	    var y = Math.sin(rad);  
	    m.identity(mMatrix);  
	    m.translate(mMatrix, [x, y + 1.0, 0.0], mMatrix);  
	      
	    // 完成模型1的坐标变换矩阵，并进行绘图  
	    m.multiply(tmpMatrix, mMatrix, mvpMatrix);  
	    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);  
	    gl.drawArrays(gl.TRIANGLES, 0, 3);  
	      
	    // 模型2沿Y轴进行旋转  
	    m.identity(mMatrix);  
	    m.translate(mMatrix, [1.0, -1.0, 0.0], mMatrix);  
	    m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);  
	      
	    // 完成模型2的坐标变换矩阵，并进行绘图  
	    m.multiply(tmpMatrix, mMatrix, mvpMatrix);  
	    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);  
	    gl.drawArrays(gl.TRIANGLES, 0, 3);  
	      
	    // 模型3进行放大缩小  
	    var s = Math.sin(rad) + 1.0;  
	    m.identity(mMatrix);  
	    m.translate(mMatrix, [-1.0, -1.0, 0.0], mMatrix);  
	    m.scale(mMatrix, [s, s, 0.0], mMatrix)  
	      
	    // 完成模型3的坐标变换矩阵，并进行绘图  
	    m.multiply(tmpMatrix, mMatrix, mvpMatrix);  
	    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);  
	    gl.drawArrays(gl.TRIANGLES, 0, 3);  
	      
	    // context刷新  
	    gl.flush();  
	      
	    // 为了循环，进行递归处理  
	    setTimeout(arguments.callee, 1000 / 30);  
	})();  



}