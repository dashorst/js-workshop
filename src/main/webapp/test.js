var jQuery;

(function(){
	jQuery.ajax({
		  url: "ws/customers",
		  success: function(data) {
			  console.log(data);
		  },
		  dataType: "json"
		});
}())