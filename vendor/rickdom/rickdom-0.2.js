/*
 * RickDOM - ricking DOM elements safety from string.
 *
 * Copyright (c) Yosuke HASEGAWA
 * http://github.com/hasegawayosuke/rickdom
 *
 * Usage:
 *     var rickdom = new RickDOM();
 *     rickdom.allowings = { "a" : { "href" : "^https?:\\/\\/", "title" : "" } };
 *     var elments = rickdom.build( "<a href='http://example.jp' onclick='alert(1)'>aa</a>" );
 *
 * Return value: array of HTMLElements
 *
 */

"use strict";
function RickDOM(){
    var _allowings;
    var _compiled;
    Object.defineProperty( this, "allowings", {
        get : function(){
            if( _allowings === undefined ) return RickDOM.prototype.allowings;
            else return _allowings;
        },
        set : function( obj ){
            _allowings = JSON.parse( JSON.stringify( obj ) ); // deep copy
            var node, attrName, attrValue, cssPropName, cssPropValue;
            _compiled = {};
            for( node in _allowings ){
                _compiled[ node ] = {};
                for( attrName in _allowings[ node ] ){
                    attrValue = _allowings[ node ][ attrName ];
                    if( attrName === "style" && typeof attrValue == "object" ){
                        _compiled[ node ][ attrName ] = {};
                        for( cssPropName in attrValue ){
                            cssPropValue = attrValue[ cssPropName ];
                            if( typeof cssPropValue == "object" && cssPropValue.pattern !== undefined ){
                                _compiled[ node ][ attrName ][ cssPropName ] = new RegExp( cssPropValue.pattern, cssPropValue.flag );
                            }
                        }
                    }else if( typeof attrValue == "object" && attrValue.pattern !== undefined ){
                        _compiled[ node ][ attrName ] = new RegExp( attrValue.pattern, attrValue.flag );
                    }else{
                        _compiled[ node ][ attrName ] = attrValue;
                    }
                }
            }
        }
    } );
    Object.defineProperty( this, "compiledAllowings", {
        get : function(){
            if( _compiled === undefined ){
                this.allowings = this.allowings;
            }
            return _compiled;
        }
    } );
    return this;
};

RickDOM.prototype.build = function( htmlString ){
    var result = [];
    var doc, body;
    var i, childNode;
    var _this = this;

    var buildNodes = function ( node ){
        var i, newNode, attributes, child;
        var attr, attrName;
        var cssPropName, cssPropValue, cssPropNameDom;

        switch( node.nodeType ){
        case 1: // ELEMENT_NODE
            attributes = _this.compiledAllowings[ node.tagName.toLowerCase() ];
            if( attributes === undefined ) return undefined;

            newNode = document.createElement( node.tagName );
            for( i = 0; i < node.attributes.length; i++ ){
                attrName = node.attributes[ i ].name;
                attr = attributes[ attrName ];
                if( attrName === "style" && typeof attr == "object" ){
                    for( cssPropName in attr ){
                        cssPropValue = attr[ cssPropName ];
                        cssPropNameDom = cssPropName.replace( /-([a-z])/g, function( s, c ){ return c.toUpperCase(); } );
                        if( cssPropValue instanceof RegExp ){
                            if( cssPropValue.test( node.style[ cssPropNameDom ] ) ){
                                newNode.style[ cssPropNameDom ] = node.style[ cssPropNameDom ];
                            }
                        }else if( typeof cssPropValue == "string" ){
                            newNode.style[ cssPropNameDom ] = node.style[ cssPropNameDom ];
                        }
                    }
                }else if( attr instanceof RegExp ){
                    if( attr.test( node.attributes[ i ].value ) ){
                        newNode.setAttribute( attrName, node.attributes[ i ].value );
                    }
                }else if( typeof attr == "string" ){
                    newNode.setAttribute( attrName, node.attributes[ i ].value );
                }
            }
            for( i = 0; i < node.childNodes.length; i++ ){
                child = buildNodes( node.childNodes[ i ] );
                if( child !== undefined ){
                    newNode.appendChild( child );
                }
            }
            return newNode;
        case 3: // TEXT_NODE
            return document.createTextNode( node.textContent );
        default:
            return undefined;
        }
    };

    if( typeof DOMParser !== "undefined" ){
        try{
            var parser = new DOMParser();
            doc = parser.parseFromString( htmlString, "text/html" );
            body = doc.body;

            for( i = 0; i < body.childNodes.length; i++ ){
                childNode = buildNodes( body.childNodes[ i ] );
                if( childNode !== undefined ){
                    result.push( document.importNode( childNode, true ) );
                }
            }
            return result;
        }catch( e ){

        }
    }
    if( document.implementation && document.implementation.createHTMLDocument ){
        body = document.implementation.createHTMLDocument("").body;
        body.innerHTML = htmlString;
        for( i = 0; i < body.childNodes.length; i++ ){
            childNode = buildNodes( body.childNodes[ i ] );
            if( childNode !== undefined ){
                result.push( document.importNode( childNode, true ) );
            }
        }
        return result;
    }else{
        throw new Error( "not suppoted" );
    }
};

RickDOM.prototype.allowings = {
    "article" : {},
    "section" : {},
    "nav" : {},
    "aside" : {},
    "h1" : {},
    "h2" : {},
    "h3" : {},
    "h4" : {},
    "h5" : {},
    "h6 ": {},
    "header" : {},
    "footer" : {},
    "address" : {},
    "p" : {},
    "hr" : {},
    "pre" : {},
    "blockquote" : { "cite" : { "pattern" : "^https?:\\/\\/" } },
    "ol" : {
        "reversed" : { "pattern" : "^(:?true|false)$", "flag" : "i" },
        "start" : { "pattern" : "^-?[\\d]+$" },
        "type" : ""
    },
    "ul" : {},
    "li" : { "value" : { "pattern" : "^-?[\\d]+$" } },
    "dl" : {},
    "dt" : {},
    "dd" : {},
    "figure" : {},
    "figcaption" : {},
    "div" : {},
    "main" : {},
    "a" : {
        "href" : { "pattern" : "^https?:\\/\\/" },
        "target" : { "pattern" : "^(:?_blank|_self)$" },
    },
    "em" : {},
    "strong" : {},
    "small" : {},
    "s" : {},
    "cite" : {},
    "q" : { "cite" : { "pattern" : "^https?:\\/\\/" } },
    "dfn" : {},
    "abbr" : {},
    "data" : { "value" : "" },
    "time" : { "datetime" : "" },
    "code" : {},
    "var" : {},
    "samp" : {},
    "kbd" : {},
    "sub" : {},
    "sup" : {},
    "i" : {},
    "b" : {},
    "u" : {},
    "mark" : {},
    "ruby" : {},
    "rb" : {},
    "rt" : {},
    "rtc" : {},
    "rp" : {},
    "bdi" : {},
    "bdo" : {},
    "span" : {},
    "br" : {},
    "wbr" : {},
    "ins" : { "cite" : { "pattern" : "^https?:\\/\\/" }, "datetime" : "" },
    "del" : { "cite" : { "pattern" : "^https?:\\/\\/" }, "datetime" : "" },
    "img" : { "alt" : "", "src" : "", "width" : "", "height" : "" },
    "table" : { "border" : "" },
    "caption" : {},
    "colgroup" : { "span" : "" },
    "col" : { "span" : "" },
    "tbody" : {},
    "thead" : {},
    "tfoot" : {},
    "tr" : {},
    "td" : { "colspan" : { "pattern" : "^[\\d]+$" }, "rowspan" : { "pattern" : "^[\\d]+$" }, "headers" : "" },
    "th" : { "colspan" : { "pattern" : "^[\\d]+$" }, "rowspan" : { "pattern" : "^[\\d]+$" }, "headers" : "", "state" : { "pattern" : "^(:?row|col|rowgroup|colgroup|auto)$", "abbr" : "" } },
    "marquee" : { "height" : "", "width" : "", "hspace" : "", "vspace" : "", "behavior" : "", "loop" : "", "direction" : "", "scrolldelay" : "", "scrollamount" : "", "bgcolor" : "" },
};

(function(){
    var defAttributes = {
        "accesskey" : "",
        "class" : "",
        "contenteditable" : { "pattern" : "^(:?true|false|inherit)$", "flag" : "i" },
        "lang" : "",
        "spellcheck" : "",
        "title" : "",
        "style" : {
            "opacity" : {
                "pattern" : "^\\s*[\\d\\.]*\\s*$"
            },
            "color" : {
                "pattern" : "^\\s*(?:#(?:[\\da-f]{3}|[\\da-f]{6})|rgb\\(\\s*(:?[\\d]+,?\\s*){3}\\))\\s*$"
             },
            "font-family" : {
                "pattern" : "^\\s*(?:[\\w\\-]+|[\"'][\\w\\s\\-]+[\"'])\\s*$"
            },
            "font-size" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|xx-small|x-small|small|medium|large|x-large|xx-large|larger|smaller)\\s*$"
            },
            "font-weight" : {
                "pattern" : "^\\s*(?:normal|bold|lighter|bolder|100|200|300|400|500|600|700|800|900)\\s*$",
            },
            "font-style" : {
                "pattern" : "\\s*(?:normal|italic|oblique)\\s*$"
            },
            "background-color" : {
                "pattern" : "^\\s*(?:#(?:[\\da-f]{3}|[\\da-f]{6})|rgb\\(\\s*(:?[\\d]+,?\\s*){3}\\))\\s*$",
                "flag" : "i"
            },
            "word-break" : {
                "pattern" : "^\\s*(?:normal|keep-all|loose|break-strict|break-all)\\s*$"
            },
            "text-wrap" : {
                "pattern" : "^\\s*(?:normal|none|unrestricted|suppress)\\s*$"
            },
            "word-wrap" : {
                "pattern" : "^\\s*(?:normal|brek-word)\\s*$"
            },
            "text-align" : {
                "pattern" : "^\\s*(?:left|right|center|justify|initial|inherit)\\s*$"
            },
            "vertical-align" : {
                "pattern" : "^\\s*(?:(?:(?:[\\-\\d\\.]+(?:em|ex|px|%))|baseline|top|middle|bottom|text-top|text-bottom|super|sub)\s*){1,4}\\s*$"
            },
            "text-decoration-line" : {
                "pattern" : "^\\s*(?:none|underline|overline|line-through)\\s*$"
            },
            "text-decoration-color" : {
                "pattern" : "^\\s*(?:#(?:[\\da-f]{3}|[\\da-f]{6})|rgb\\(\\s*(:?[\\d]+,?\\s*){3}\\))\\s*$"
            },
            "text-decoration-style" : {
                "pattern" : "^\\s*(?:solid|double|dotted|dashed|wavy)\\s*$"
            },
            "margin" : {
                "pattern" : "^\\s*(?:(?:(?:[\\d\\.]+(?:em|ex|px|%))|auto)\s*){1,4}\\s*$"
            },
            "margin-bottom" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|auto)\\s*$"
            },
            "margin-left" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|auto)\\s*$"
            },
            "margin-top" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|auto)\\s*$"
            },
            "margin-right" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|auto)\\s*$"
            },
            "padding" : {
                "pattern" : "^\\s*(?:(?:(?:[\\d\\.]+(?:em|ex|px|%))|auto)\s*){1,4}\\s*$"
            },
            "padding-bottom" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|auto)\\s*$"
            },
            "padding-left" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|auto)\\s*$"
            },
            "padding-top" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|auto)\\s*$"
            },
            "padding-right" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|auto)\\s*$"
            },
            "height" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|auto)\\s*$"
            },
            "width" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|auto)\\s*$"
            },
            "display" : {
                "pattern" : "^\\s*(?:inline|block|inline-block|list-item|run-in|compact|none)\\s*$"
            },
            "border-width" : {
                "pattern" : "^\\s*(?:(?:(?:[\\d\\.]+(?:em|ex|px|%))|thin|medium|thick)\s*){1,4}\\s*$"
            },
            "border-top-width" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|thin|medium|thick)\\s*$"
            },
            "border-left-width" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|thin|medium|thick)\\s*$"
            },
            "border-bottom-width" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|thin|medium|thick)\\s*$"
            },
            "border-right-width" : {
                "pattern" : "^\\s*(?:(?:[\\d\\.]+(?:em|ex|px|%))|thin|medium|thick)\\s*$"
            },
            "border-color" : {
                "pattern" : "^\\s*(?:(?:#(?:[\\da-f]{3}|[\\da-f]{6})|rgb\\(\\s*(:?[\\d]+,?\\s*){3}\\))\\s*){1,4}\\s*$"
            },
            "border-top-color" : {
                "pattern" : "^\\s*(?:#(?:[\\da-f]{3}|[\\da-f]{6})|rgb\\(\\s*(:?[\\d]+,?\\s*){3}\\))\\s*$"
            },
            "border-left-color" : {
                "pattern" : "^\\s*(?:#(?:[\\da-f]{3}|[\\da-f]{6})|rgb\\(\\s*(:?[\\d]+,?\\s*){3}\\))\\s*$"
            },
            "border-bottom-color" : {
                "pattern" : "^\\s*(?:#(?:[\\da-f]{3}|[\\da-f]{6})|rgb\\(\\s*(:?[\\d]+,?\\s*){3}\\))\\s*$"
            },
            "border-right-color" : {
                "pattern" : "^\\s*(?:#(?:[\\da-f]{3}|[\\da-f]{6})|rgb\\(\\s*(:?[\\d]+,?\\s*){3}\\))\\s*$"
            },
            "border-style" : {
                "pattern" : "^\\s*(?:(?:none|hidden|solid|double|groove|ridge|inset|outset|dotted|dashed)\\s*){1,4}\\s*$"
            },
            "border-top-style" : {
                "pattern" : "^\\s*(?:none|hidden|solid|double|groove|ridge|inset|outset|dotted|dashed)\\s*$"
            },
            "border-left-style" : {
                "pattern" : "^\\s*(?:none|hidden|solid|double|groove|ridge|inset|outset|dotted|dashed)\\s*$"
            },
            "border-bottom-style" : {
                "pattern" : "^\\s*(?:none|hidden|solid|double|groove|ridge|inset|outset|dotted|dashed)\\s*$"
            },
            "border-right-style" : {
                "pattern" : "^\\s*(?:none|hidden|solid|double|groove|ridge|inset|outset|dotted|dashed)\\s*$"
            },
        },
    };
    for( var node in RickDOM.prototype.allowings ){
        for( var attr in defAttributes ){
            if( RickDOM.prototype.allowings[ node ][ attr ] === undefined ){
                RickDOM.prototype.allowings[ node ][ attr ] = defAttributes[ attr ];
            }
        }
    }
})();
