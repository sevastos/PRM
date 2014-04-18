var num = 31;
var layers = [];
for (var i=0;i < num; i++){
	layers.push(
		i + 'px ' + (i + 1) + 'px 0 layer(' + i + ')',
		(i + 1) + 'px ' + i + 'px 0 layer(' + i + ')',
		(i + 1) + 'px ' + (i + 1) + 'px 0 layer(' + i + ')'
	);
}

console.log(layers.join(', '));