function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/html-parser/writer/minify.js']) {
  _$jscoverage['/html-parser/writer/minify.js'] = {};
  _$jscoverage['/html-parser/writer/minify.js'].lineData = [];
  _$jscoverage['/html-parser/writer/minify.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[22] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[23] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[26] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[29] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[36] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[39] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[40] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[43] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[71] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[75] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[79] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[80] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[94] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[95] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[110] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[111] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[115] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[116] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[118] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[125] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[147] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[148] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[150] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[158] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[159] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[160] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[168] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[170] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[172] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[179] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[181] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[190] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[191] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[195] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[201] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[204] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[207] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[209] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[210] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[214] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[216] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[219] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[222] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[229] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[230] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[232] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[234] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[238] = 0;
}
if (! _$jscoverage['/html-parser/writer/minify.js'].functionData) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData = [];
  _$jscoverage['/html-parser/writer/minify.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[9] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[10] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[11] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[12] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[13] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[14] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[15] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[16] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[17] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[18] = 0;
}
if (! _$jscoverage['/html-parser/writer/minify.js'].branchData) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData = {};
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['25'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['42'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['47'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['51'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['55'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['59'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['63'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['66'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['66'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['67'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][7] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['109'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['110'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['115'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['118'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['122'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['158'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['169'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['180'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['198'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['201'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['207'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['216'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['230'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['230'][1] = new BranchData();
}
_$jscoverage['/html-parser/writer/minify.js'].branchData['230'][1].init(46, 11, '!self.inPre');
function visit534_230_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['216'][1].init(668, 40, 'value && canRemoveAttributeQuotes(value)');
function visit533_216_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['207'][1].init(382, 24, 'isBooleanAttribute(name)');
function visit532_207_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['201'][1].init(194, 129, 'canDeleteEmptyAttribute(el, attr) || isAttributeRedundant(el, attr)');
function visit531_201_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['198'][1].init(107, 16, 'attr.value || ""');
function visit530_198_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['180'][1].init(46, 19, 'el.tagName == \'pre\'');
function visit529_180_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['169'][1].init(46, 19, 'el.tagName == \'pre\'');
function visit528_169_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['158'][1].init(17, 26, 'isConditionalComment(text)');
function visit527_158_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['122'][1].init(589, 20, 'attrName === \'style\'');
function visit526_122_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['118'][1].init(431, 85, 'isUriTypeAttribute(attrName, tag) || isNumberTypeAttribute(attrName, tag)');
function visit525_118_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['115'][1].init(318, 20, 'attrName === \'class\'');
function visit524_115_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['110'][1].init(120, 26, 'isEventAttribute(attrName)');
function visit523_110_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['109'][1].init(80, 16, 'attr.value || ""');
function visit522_109_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['102'][7].init(117, 22, 'attrName === \'colspan\'');
function visit521_102_7(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][7].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['102'][6].init(91, 22, 'attrName === \'rowspan\'');
function visit520_102_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['102'][5].init(91, 48, 'attrName === \'rowspan\' || attrName === \'colspan\'');
function visit519_102_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['102'][4].init(74, 11, 'tag == \'td\'');
function visit518_102_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['102'][3].init(58, 12, 'tag === \'th\'');
function visit517_102_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['102'][2].init(58, 27, 'tag === \'th\' || tag == \'td\'');
function visit516_102_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['102'][1].init(58, 82, '(tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\')');
function visit515_102_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][4].init(467, 19, 'attrName === \'span\'');
function visit514_101_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][3].init(450, 13, 'tag === \'col\'');
function visit513_101_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][2].init(450, 36, 'tag === \'col\' && attrName === \'span\'');
function visit512_101_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][1].init(62, 142, '(tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit511_101_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][4].init(408, 19, 'attrName === \'span\'');
function visit510_100_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][3].init(386, 18, 'tag === \'colgroup\'');
function visit509_100_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][2].init(386, 41, 'tag === \'colgroup\' && attrName === \'span\'');
function visit508_100_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][1].init(86, 205, '(tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit507_100_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][3].init(298, 18, 'tag === \'textarea\'');
function visit506_99_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][2].init(298, 65, 'tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)');
function visit505_99_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][1].init(89, 292, '(tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit504_99_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][6].init(251, 23, 'attrName === \'tabindex\'');
function visit503_98_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][5].init(228, 19, 'attrName === \'size\'');
function visit502_98_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][4].init(228, 46, 'attrName === \'size\' || attrName === \'tabindex\'');
function visit501_98_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][3].init(207, 16, 'tag === \'select\'');
function visit500_98_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][2].init(207, 68, 'tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')');
function visit499_98_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][1].init(93, 382, '(tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit498_98_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][6].init(160, 23, 'attrName === \'tabindex\'');
function visit497_97_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][5].init(132, 24, 'attrName === \'maxlength\'');
function visit496_97_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][4].init(132, 51, 'attrName === \'maxlength\' || attrName === \'tabindex\'');
function visit495_97_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][3].init(112, 15, 'tag === \'input\'');
function visit494_97_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][2].init(112, 72, 'tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')');
function visit493_97_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][1].init(87, 476, '(tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')) || (tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit492_97_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][3].init(66, 23, 'attrName === \'tabindex\'');
function visit491_96_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][2].init(23, 66, '(/^(?:a|area|object|button)$/).test(tag) && attrName === \'tabindex\'');
function visit490_96_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][1].init(-1, 564, '((/^(?:a|area|object|button)$/).test(tag) && attrName === \'tabindex\') || (tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')) || (tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit489_96_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['90'][5].init(104, 18, 'attrName === \'for\'');
function visit488_90_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['90'][4].init(82, 18, 'attrName === \'src\'');
function visit487_90_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['90'][3].init(82, 40, 'attrName === \'src\' || attrName === \'for\'');
function visit486_90_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['90'][2].init(61, 16, 'tag === \'script\'');
function visit485_90_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['90'][1].init(61, 62, 'tag === \'script\' && (attrName === \'src\' || attrName === \'for\')');
function visit484_90_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][4].init(652, 22, 'attrName === \'profile\'');
function visit483_89_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][3].init(634, 14, 'tag === \'head\'');
function visit482_89_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][2].init(634, 40, 'tag === \'head\' && attrName === \'profile\'');
function visit481_89_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][1].init(85, 125, '(tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit480_89_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][6].init(589, 21, 'attrName === \'usemap\'');
function visit479_88_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][5].init(567, 18, 'attrName === \'src\'');
function visit478_88_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][4].init(567, 43, 'attrName === \'src\' || attrName === \'usemap\'');
function visit477_88_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][3].init(547, 15, 'tag === \'input\'');
function visit476_88_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][2].init(547, 64, 'tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')');
function visit475_88_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][1].init(60, 211, '(tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit474_88_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][4].init(503, 21, 'attrName === \'action\'');
function visit473_87_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][3].init(485, 14, 'tag === \'form\'');
function visit472_87_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][2].init(485, 39, 'tag === \'form\' && attrName === \'action\'');
function visit471_87_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][1].init(75, 272, '(tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit470_87_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][6].init(443, 19, 'attrName === \'cite\'');
function visit469_86_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][5].init(425, 13, 'tag === \'del\'');
function visit468_86_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][4].init(408, 13, 'tag === \'ins\'');
function visit467_86_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][3].init(408, 30, 'tag === \'ins\' || tag === \'del\'');
function visit466_86_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][2].init(408, 54, '(tag === \'ins\' || tag === \'del\') && attrName === \'cite\'');
function visit465_86_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][1].init(65, 348, '((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit464_86_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][4].init(365, 19, 'attrName === \'cite\'');
function visit463_85_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][3].init(341, 20, 'tag === \'blockquote\'');
function visit462_85_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][2].init(341, 43, 'tag === \'blockquote\' && attrName === \'cite\'');
function visit461_85_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][1].init(55, 414, '(tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit460_85_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][4].init(299, 19, 'attrName === \'cite\'');
function visit459_84_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][3].init(284, 11, 'tag === \'q\'');
function visit458_84_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][2].init(284, 34, 'tag === \'q\' && attrName === \'cite\'');
function visit457_84_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][1].init(94, 470, '(tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit456_84_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][3].init(188, 16, 'tag === \'object\'');
function visit455_83_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][2].init(188, 73, 'tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)');
function visit454_83_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][1].init(82, 565, '(tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit453_83_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][3].init(104, 13, 'tag === \'img\'');
function visit452_82_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][2].init(104, 61, 'tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)');
function visit451_82_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][1].init(79, 648, '(tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)) || (tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit450_82_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][3].init(62, 19, 'attrName === \'href\'');
function visit449_81_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][2].init(23, 58, '(/^(?:a|area|link|base)$/).test(tag) && attrName === \'href\'');
function visit448_81_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][1].init(-1, 728, '((/^(?:a|area|link|base)$/).test(tag) && attrName === \'href\') || (tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)) || (tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit447_81_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['67'][1].init(43, 20, 'attrValue === \'rect\'');
function visit446_67_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['66'][2].init(168, 20, 'attrName === \'shape\'');
function visit445_66_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['66'][1].init(37, 64, 'attrName === \'shape\' && attrValue === \'rect\'');
function visit444_66_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['65'][2].init(128, 14, 'tag === \'area\'');
function visit443_65_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['65'][1].init(128, 102, 'tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\'');
function visit442_65_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['63'][1].init(42, 24, 'attrValue === \'text/css\'');
function visit441_63_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['62'][2].init(40, 19, 'attrName === \'type\'');
function visit440_62_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['62'][1].init(38, 67, 'attrName === \'type\' && attrValue === \'text/css\'');
function visit439_62_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['61'][3].init(541, 15, 'tag === \'style\'');
function visit438_61_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['61'][2].init(541, 106, 'tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\'');
function visit437_61_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['61'][1].init(136, 232, '(tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit436_61_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['59'][1].init(42, 31, 'attrValue === \'text/javascript\'');
function visit435_59_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['58'][2].init(41, 19, 'attrName === \'type\'');
function visit434_58_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['58'][1].init(39, 74, 'attrName === \'type\' && attrValue === \'text/javascript\'');
function visit433_58_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['57'][3].init(403, 16, 'tag === \'script\'');
function visit432_57_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['57'][2].init(403, 114, 'tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\'');
function visit431_57_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['57'][1].init(124, 369, '(tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit430_57_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['55'][1].init(42, 20, 'attrValue === \'text\'');
function visit429_55_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['54'][2].init(40, 19, 'attrName === \'type\'');
function visit428_54_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['54'][1].init(38, 63, 'attrName === \'type\' && attrValue === \'text\'');
function visit427_54_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['53'][3].init(277, 15, 'tag === \'input\'');
function visit426_53_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['53'][2].init(277, 102, 'tag === \'input\' && attrName === \'type\' && attrValue === \'text\'');
function visit425_53_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['53'][1].init(124, 494, '(tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit424_53_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['51'][1].init(44, 19, 'attrValue === \'get\'');
function visit423_51_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['50'][2].init(39, 21, 'attrName === \'method\'');
function visit422_50_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['50'][1].init(37, 64, 'attrName === \'method\' && attrValue === \'get\'');
function visit421_50_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['49'][3].init(151, 14, 'tag === \'form\'');
function visit420_49_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['49'][2].init(151, 102, 'tag === \'form\' && attrName === \'method\' && attrValue === \'get\'');
function visit419_49_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['49'][1].init(127, 619, '(tag === \'form\' && attrName === \'method\' && attrValue === \'get\') || (tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit418_49_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['47'][1].init(42, 26, 'attrValue === \'javascript\'');
function visit417_47_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['46'][2].init(37, 23, 'attrName === \'language\'');
function visit416_46_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['46'][1].init(35, 69, 'attrName === \'language\' && attrValue === \'javascript\'');
function visit415_46_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['45'][3].init(22, 16, 'tag === \'script\'');
function visit414_45_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['45'][2].init(22, 105, 'tag === \'script\' && attrName === \'language\' && attrValue === \'javascript\'');
function visit413_45_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['45'][1].init(-1, 747, '(tag === \'script\' && attrName === \'language\' && attrValue === \'javascript\') || (tag === \'form\' && attrName === \'method\' && attrValue === \'get\') || (tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit412_45_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['42'][1].init(80, 16, 'attr.value || ""');
function visit411_42_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['26'][4].init(41, 20, 'attrName === \'value\'');
function visit410_26_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['26'][3].init(22, 15, 'tag === \'input\'');
function visit409_26_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['26'][2].init(22, 39, 'tag === \'input\' && attrName === \'value\'');
function visit408_26_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['26'][1].init(22, 91, '(tag === \'input\' && attrName === \'value\') || reEmptyAttribute.test(attrName)');
function visit407_26_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['25'][1].init(89, 16, '!trim(attrValue)');
function visit406_25_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['23'][1].init(25, 16, 'attr.value || ""');
function visit405_23_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[0]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[7]++;
  var BasicWriter = require('./basic');
  _$jscoverage['/html-parser/writer/minify.js'].lineData[8]++;
  var Utils = require('../utils');
  _$jscoverage['/html-parser/writer/minify.js'].lineData[10]++;
  var trim = S.trim, isBooleanAttribute = Utils.isBooleanAttribute, collapseWhitespace = Utils.collapseWhitespace, reEmptyAttribute = new RegExp('^(?:class|id|style|title|lang|dir|on' + '(?:focus|blur|change|click|dblclick|mouse(' + '?:down|up|over|move|out)|key(?:press|down|up)))$');
  _$jscoverage['/html-parser/writer/minify.js'].lineData[18]++;
  function escapeAttrValue(str) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[1]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[19]++;
    return String(str).replace(/"/g, "&quote;");
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[22]++;
  function canDeleteEmptyAttribute(tag, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[2]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[23]++;
    var attrValue = visit405_23_1(attr.value || ""), attrName = attr.name;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[25]++;
    if (visit406_25_1(!trim(attrValue))) {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[26]++;
      return (visit407_26_1((visit408_26_2(visit409_26_3(tag === 'input') && visit410_26_4(attrName === 'value'))) || reEmptyAttribute.test(attrName)));
    }
    _$jscoverage['/html-parser/writer/minify.js'].lineData[29]++;
    return 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[33]++;
  function canRemoveAttributeQuotes(value) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[3]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[36]++;
    return !(/[ "'=<>`]/).test(value);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[39]++;
  function isAttributeRedundant(el, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[4]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[40]++;
    var tag = el.nodeName, attrName = attr.name, attrValue = visit411_42_1(attr.value || "");
    _$jscoverage['/html-parser/writer/minify.js'].lineData[43]++;
    attrValue = trim(attrValue.toLowerCase());
    _$jscoverage['/html-parser/writer/minify.js'].lineData[44]++;
    return (visit412_45_1((visit413_45_2(visit414_45_3(tag === 'script') && visit415_46_1(visit416_46_2(attrName === 'language') && visit417_47_1(attrValue === 'javascript')))) || visit418_49_1((visit419_49_2(visit420_49_3(tag === 'form') && visit421_50_1(visit422_50_2(attrName === 'method') && visit423_51_1(attrValue === 'get')))) || visit424_53_1((visit425_53_2(visit426_53_3(tag === 'input') && visit427_54_1(visit428_54_2(attrName === 'type') && visit429_55_1(attrValue === 'text')))) || visit430_57_1((visit431_57_2(visit432_57_3(tag === 'script') && visit433_58_1(visit434_58_2(attrName === 'type') && visit435_59_1(attrValue === 'text/javascript')))) || visit436_61_1((visit437_61_2(visit438_61_3(tag === 'style') && visit439_62_1(visit440_62_2(attrName === 'type') && visit441_63_1(attrValue === 'text/css')))) || (visit442_65_1(visit443_65_2(tag === 'area') && visit444_66_1(visit445_66_2(attrName === 'shape') && visit446_67_1(attrValue === 'rect'))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[71]++;
  function isConditionalComment(text) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[5]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[72]++;
    return (/\[if[^\]]+\]/).test(text);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[75]++;
  function isEventAttribute(attrName) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[6]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[76]++;
    return (/^on[a-z]+/).test(attrName);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[79]++;
  function isUriTypeAttribute(attrName, tag) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[7]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[80]++;
    return (visit447_81_1((visit448_81_2((/^(?:a|area|link|base)$/).test(tag) && visit449_81_3(attrName === 'href'))) || visit450_82_1((visit451_82_2(visit452_82_3(tag === 'img') && (/^(?:src|longdesc|usemap)$/).test(attrName))) || visit453_83_1((visit454_83_2(visit455_83_3(tag === 'object') && (/^(?:classid|codebase|data|usemap)$/).test(attrName))) || visit456_84_1((visit457_84_2(visit458_84_3(tag === 'q') && visit459_84_4(attrName === 'cite'))) || visit460_85_1((visit461_85_2(visit462_85_3(tag === 'blockquote') && visit463_85_4(attrName === 'cite'))) || visit464_86_1((visit465_86_2((visit466_86_3(visit467_86_4(tag === 'ins') || visit468_86_5(tag === 'del'))) && visit469_86_6(attrName === 'cite'))) || visit470_87_1((visit471_87_2(visit472_87_3(tag === 'form') && visit473_87_4(attrName === 'action'))) || visit474_88_1((visit475_88_2(visit476_88_3(tag === 'input') && (visit477_88_4(visit478_88_5(attrName === 'src') || visit479_88_6(attrName === 'usemap'))))) || visit480_89_1((visit481_89_2(visit482_89_3(tag === 'head') && visit483_89_4(attrName === 'profile'))) || (visit484_90_1(visit485_90_2(tag === 'script') && (visit486_90_3(visit487_90_4(attrName === 'src') || visit488_90_5(attrName === 'for')))))))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[94]++;
  function isNumberTypeAttribute(attrName, tag) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[8]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[95]++;
    return (visit489_96_1((visit490_96_2((/^(?:a|area|object|button)$/).test(tag) && visit491_96_3(attrName === 'tabindex'))) || visit492_97_1((visit493_97_2(visit494_97_3(tag === 'input') && (visit495_97_4(visit496_97_5(attrName === 'maxlength') || visit497_97_6(attrName === 'tabindex'))))) || visit498_98_1((visit499_98_2(visit500_98_3(tag === 'select') && (visit501_98_4(visit502_98_5(attrName === 'size') || visit503_98_6(attrName === 'tabindex'))))) || visit504_99_1((visit505_99_2(visit506_99_3(tag === 'textarea') && (/^(?:rows|cols|tabindex)$/).test(attrName))) || visit507_100_1((visit508_100_2(visit509_100_3(tag === 'colgroup') && visit510_100_4(attrName === 'span'))) || visit511_101_1((visit512_101_2(visit513_101_3(tag === 'col') && visit514_101_4(attrName === 'span'))) || (visit515_102_1((visit516_102_2(visit517_102_3(tag === 'th') || visit518_102_4(tag == 'td'))) && (visit519_102_5(visit520_102_6(attrName === 'rowspan') || visit521_102_7(attrName === 'colspan'))))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[106]++;
  function cleanAttributeValue(el, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[9]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[107]++;
    var tag = el.nodeName, attrName = attr.name, attrValue = visit522_109_1(attr.value || "");
    _$jscoverage['/html-parser/writer/minify.js'].lineData[110]++;
    if (visit523_110_1(isEventAttribute(attrName))) {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[111]++;
      attrValue = trim(attrValue).replace(/^javascript:[\s\xa0]*/i, '').replace(/[\s\xa0]*;$/, '');
    } else {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[115]++;
      if (visit524_115_1(attrName === 'class')) {
        _$jscoverage['/html-parser/writer/minify.js'].lineData[116]++;
        attrValue = collapseWhitespace(trim(attrValue));
      } else {
        _$jscoverage['/html-parser/writer/minify.js'].lineData[118]++;
        if (visit525_118_1(isUriTypeAttribute(attrName, tag) || isNumberTypeAttribute(attrName, tag))) {
          _$jscoverage['/html-parser/writer/minify.js'].lineData[120]++;
          attrValue = trim(attrValue);
        } else {
          _$jscoverage['/html-parser/writer/minify.js'].lineData[122]++;
          if (visit526_122_1(attrName === 'style')) {
            _$jscoverage['/html-parser/writer/minify.js'].lineData[123]++;
            attrValue = trim(attrValue).replace(/[\s\xa0]*;[\s\xa0]*$/, '');
          }
        }
      }
    }
    _$jscoverage['/html-parser/writer/minify.js'].lineData[125]++;
    return attrValue;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[128]++;
  function cleanConditionalComment(comment) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[10]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[129]++;
    return comment.replace(/^(\[[^\]]+\]>)[\s\xa0]*/, '$1').replace(/[\s\xa0]*(<!\[endif\])$/, '$1');
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[134]++;
  function removeCDATASections(text) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[11]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[135]++;
    return trim(text).replace(/^(?:[\s\xa0]*\/\*[\s\xa0]*<!\[CDATA\[[\s\xa0]*\*\/|[\s\xa0]*\/\/[\s\xa0]*<!\[CDATA\[.*)/, '').replace(/(?:\/\*[\s\xa0]*\]\]>[\s\xa0]*\*\/|\/\/[\s\xa0]*\]\]>)[\s\xa0]*$/, '');
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[147]++;
  function MinifyWriter() {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[12]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[148]++;
    var self = this;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[149]++;
    MinifyWriter.superclass.constructor.apply(self, arguments);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[150]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[153]++;
  S.extend(MinifyWriter, BasicWriter, {
  comment: function(text) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[13]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[158]++;
  if (visit527_158_1(isConditionalComment(text))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[159]++;
    text = cleanConditionalComment(text);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[160]++;
    MinifyWriter.superclass.comment.call(this, text);
  }
}, 
  openTag: function(el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[14]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[168]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[169]++;
  if (visit528_169_1(el.tagName == 'pre')) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[170]++;
    self.inPre = 1;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[172]++;
  MinifyWriter.superclass.openTag.apply(self, arguments);
}, 
  closeTag: function(el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[15]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[179]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[180]++;
  if (visit529_180_1(el.tagName == 'pre')) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[181]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[183]++;
  MinifyWriter.superclass.closeTag.apply(self, arguments);
}, 
  cdata: function(cdata) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[16]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[190]++;
  cdata = removeCDATASections(cdata);
  _$jscoverage['/html-parser/writer/minify.js'].lineData[191]++;
  MinifyWriter.superclass.cdata.call(this, cdata);
}, 
  attribute: function(attr, el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[17]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[195]++;
  var self = this, name = attr.name, normalizedValue, value = visit530_198_1(attr.value || "");
  _$jscoverage['/html-parser/writer/minify.js'].lineData[201]++;
  if (visit531_201_1(canDeleteEmptyAttribute(el, attr) || isAttributeRedundant(el, attr))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[204]++;
    return;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[207]++;
  if (visit532_207_1(isBooleanAttribute(name))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[209]++;
    self.append(" ", name);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[210]++;
    return;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[214]++;
  normalizedValue = escapeAttrValue(cleanAttributeValue(el, attr));
  _$jscoverage['/html-parser/writer/minify.js'].lineData[216]++;
  if (visit533_216_1(value && canRemoveAttributeQuotes(value))) {
  } else {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[219]++;
    normalizedValue = '"' + normalizedValue + '"';
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[222]++;
  self.append(" ", name, "=", normalizedValue);
}, 
  text: function(text) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[18]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[229]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[230]++;
  if (visit534_230_1(!self.inPre)) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[232]++;
    text = collapseWhitespace(text);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[234]++;
  self.append(text);
}});
  _$jscoverage['/html-parser/writer/minify.js'].lineData[238]++;
  return MinifyWriter;
});
