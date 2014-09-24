///
///	2014/8/7
///	By:Jruif
///
(function($,undefined) {
	$.fn.jruif = function(options) {
		var _this = $(this);
		var config = {
			rollingLinks: true, //bool值
			slideLoad:false
		}
		$.extend(config, options);
		var css3 = {
			transforms2d: function() {
				return 'transform' in document.body.style || 'WebkitTransform' in document.body.style || 'MozTransform' in document.body.style || 'msTransform' in document.body.style || 'OTransform' in document.body.style;
			},
			transforms3d: function() {
				return 'perspective' in document.body.style || 'WebkitPerspective' in document.body.style || 'MozPerspective' in document.body.style || 'msPerspective' in document.body.style || 'OPerspective' in document.body.style;
			}
		}

		function init() {
			if (config.rollingLinks) {
				disableRollingLinks();
			} else {
				enableRollingLinks();
			}
			if(config.slideLoad){
				slideLoading();
			}
		}

		/**
		 * Unwrap all 3D links.
		 */

		function enableRollingLinks() {
			var arolls = _this.find("a");
			arolls.each(function() {
				var $this = $(this),
					$span = $this.find("span");
				if ( !! $span) {
					$this
						.text($span.text())
						.remove("roll");
					$span.remove();
				}
			});

		}
		/**
		 * Wrap all links in 3D goodness.
		 */

		function disableRollingLinks() {
			if (css3.transforms3d()) {
				var arolls = _this.find("a");
				arolls.each(function() {
					var $this = $(this);
					if ($this.children().length<1 && !$this.attr("class")) {
						var atext = $this.text();
						var span = "<span>" + atext + "</span>";
						$this
							.text("")
							.addClass("roll")
							.append(span);
						$this.find("span").attr("data-title", atext);
					}
				});
			}
		}

		/**
		 * 缓动加载
		 */
		var $article=null;
		function slideLoading(){
			$article=$(".post").clone();
			$(".post").remove();
			$article.eq(0)
				.css("margin-top","1000px");
			setTimeout(function(){
				slideLoaded(1);
				setTimeout(function(){
					slideLoaded(2);
				}, 1000);
			}, 1000);
			$(document).on("scroll",function(){
				//slideLoaded(n)
			});
		}
		function slideLoaded(n){
			if(arguments[0]>=$article.length)
				return false;
			if(n>0){
				$article.eq(n-1)
					.appendTo("#wrapper")
					.css("margin-top","0px");
				$article.eq(n)
					.css("margin-top","1000px");
			}
		}
		
		init();
		return this;
	}
})(window.jQuery || jQuery)