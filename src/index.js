"use strict";

var toReference = require('./helpers/to-reference');
var flattenExpressions = require('./helpers/flatten-expressions');
var createTemplateKey = require('./createTemplateKey');
var addTemplatesToModule = require('./addTemplatesToModule');

function nullObject() {
  return Object.create(null);
}

function setupInjector(program, parent, scope, file) {
	file.setDynamic(namespace, nullObject);
}

function isComponent(name) {
	return name.charAt(0).toUpperCase() === name.charAt(0);
}

function processElement(t, element, root, parentTemplateElem) {
	if (element.type === "JSXElement") {
		if (element.openingElement) {
			var tagName = element.openingElement.name.name;
			var templateElem;

			if(!isComponent(tagName)) {
				templateElem = {
					tag: tagName,
					children: null
				}

			} else {
				var index = root.templateValues.length;
				root.expressionMap[tagName] = index;
				root.templateValues.push(t.identifier(tagName));
				templateElem = {
					component: {
						index: index
					},
					children: null
				}
			}

			root.templateString += tagName + "|";
			if (!root.templateElem) {
				root.templateElem = templateElem;
			}
			if (!element.selfClosing) {
				templateElem.children = [];
				processChildren(t, element.children, root, templateElem);
			}
			if (parentTemplateElem) {
				parentTemplateElem.children.push(templateElem);
			}
		}
	} else if (element.type === "JSXExpressionContainer") {
		var index = root.templateValues.length;

		root.templateString += "$$|";
		root.expressionMap[element.expression] = index;
		root.templateValues.push(element.expression);
		parentTemplateElem.children.push({
			index: index
		});
	} else if (element.type === "Literal") {
		parentTemplateElem.children.push(element.value);
		root.templateValues.push(element);
		root.templateString += element.value + "|";
	}
}

function processChildren(t, children, root, parentTemplateElem) {
	if(children) {
		for(var i = 0; i < children.length; i++) {
			var child = children[i];
			processElement(t, child, root, parentTemplateElem);
		}
	}
}

module.exports = function(options) {
	var Plugin = options.Plugin;
	var t = options.types;

	return new Plugin("inferno", { visitor : {
		Program: {
			exit(node, parent, scope, opts) {
				for(var templateKey in opts.roots) {
					var root = opts.roots[templateKey];
					addTemplatesToModule(t, node, templateKey, root);
				}
			}
		},

		JSXElement: {
      		enter(node, parent, scope, opts) {
				if (node.root !== undefined) {
					return;
				}

				var root = {
					templateValues: [],
					templateElem: null,
					templateString: "",
					templateKey: null,
					expressionMap: {}
				};

				processElement(t, node, root, null);
				//create the templateKey
				root.templateKey =  "tpl" + createTemplateKey(root.templateString);

				var values = t.literal(null);
				var expressions = flattenExpressions(t, root.templateValues);

				if (root.templateValues.length === 1) {
					values = t.toExpression(expressions[0]);
				} else if(root.templateValues.length > 1) {
					values = t.arrayExpression(expressions);
				}

				if (!opts.roots) {
					opts.roots = {};
				}
				opts.roots[root.templateKey] = root;

				return t.callExpression(t.identifier("Inferno.createFragment"), [values, t.identifier(root.templateKey)]);
      		}
      	}
	}});
};
