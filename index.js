let filename;
function selectOPCode(op) {
    switch(op){
        case 0:
            return "UNKNOWN";
        case 1:
            return "START EVENT V3";
        case 2:
            return "QUERY";
        case 3:
            return "STOP";
        case 4:
            return "ROTATE";
        case 5:
            return "INTVAR";
        case 7:
            return "SLAVE";
        case 9:
            return "Append Block";
        case 11:
            return "DELETE FILE";
        case 13:
            return "RAND";
        case 14:
            return "USER VAR";
        case 15:
            return "FORMAT DESCRIPTION";
        case 16:
            return "XID";
        case 17:
            return "BEGIN LOAD QUERY";
        case 18:
            return "EXECUTE LOAD QUERY";
        case 19:
            return "TABLE MAP";
        case 23:
            return "WRITE(INSERT) ROWS V1";
        case 24:
            return "UPDATE ROWS V1";
        case 25:
            return "DELETE ROWS V1";
        case 26:
            return "INCIDENT";
        case 27:
            return "HEARTBEAT LOG";
        case 28:
            return "IGNORABLE LOG";
        case 29:
            return "ROWS QUERY LOG";
        case 30:
            return "WRITE(INSERT) ROWS";
        case 31:
            return "UPDATE ROWS";
        case 32:
            return "DELETE ROWS";
        case 33:
            return "GTID LOG";
        case 34:
            return "ANONYMOUS GTID LOG";
        case 35:
            return "PREVIOUS GTIDS LOG";
        case 36:
            return "TRANSACTION CONTEXT";
        case 37:
            return "VIEW CHANGE";
        case 38:
            return "XA PREAPARE LOG";
        case 39:
            return "PARTIAL UPDATE ROWS";
        case 40:
            return "TRANSACTION PAYLOAD";
        case 41:
            return "HEARTBEAT LOG V2";
        default:
            return "REALLY UNKOWN";
    }
}
function mysqlBinaryFileConvert() {
    let input, file, fr;
    if (typeof window.FileReader !== 'function') {
        bodyAppend("p", "The file API isn't supported on this browser yet.");
        return;
    }

    input = document.querySelector('#file');
    if (!input) {
        alert("Um, couldn't find the fileinput element.");
    } else if (!input.files) {
        alert("This browser doesn't seem to support the `files` property of file inputs.");
    } else if (!input.files[0]) {
        alert("Please select a file before clicking 'Load'");
    } else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedBinary;
        fr.readAsBinaryString(file);
        filename=file.name;
    }

    function receivedBinary() {
        showResult(fr);
    }
    function showResult(fr) {
        var big_array = [], result, n = 4, a_byte, byte_string, line_info = [], big_ascii = [];
        result = fr.result;
        while(n < result.length){
            if(result.charCodeAt(n)==NaN) break;
            let small_array = new Array;
            let small_ascii = new Array;
            let row_commited_timestamp = 0;
            let row_operation_type;
            let row_server_id = 0;
            let row_position = 0;
            let row_length = 0;
            for(let i=0;i<17;i++, n++){
                a_byte = result.charCodeAt(n);
                if(0<=i && i<=3){
                    let multiple = 1;
                    for(let j=0; j<i;j++){
                        multiple*=256;
                    }
                    row_commited_timestamp += (a_byte)*multiple;
                } else if(i == 4) {
                    row_operation_type = ""+selectOPCode(a_byte);
                } else if(5<=i && i<=8){
                    let multiple = 1;
                    for(let j=5; j<i;j++){
                        multiple*=256;
                    }
                    row_server_id += (a_byte)*multiple;
                } else if(9<=i && i<=12){
                    let multiple = 1;
                    for(let j=9; j<i;j++){
                        multiple*=256;
                    }
                    row_length += (a_byte)*multiple;
                } else if(13<=i && i<=16){
                    let multiple = 1;
                    for(let j=13; j<i;j++){
                        multiple*=256;
                    }
                    row_position += (a_byte)*multiple;
                }
                byte_string = a_byte.toString(16);
                if (byte_string.length < 2) {
                    byte_string = "0" + byte_string;
                }
                small_ascii.push(result[n]);
                small_array.push(byte_string);
            }
            if(row_operation_type == "REALLY UKNOWN"){
                alert("ERROR?");
                break;
            }
            line_info.push("COMMITED TIMESTAMP: "+row_commited_timestamp+", OPCODE: "+row_operation_type+", SERVER ID: "+row_server_id+", LENGTH: "+row_length+", POSITION: "+row_position);
            for (let i=0; i < row_length - 17;i++, n++) {
                a_byte = result.charCodeAt(n);
                byte_string = a_byte.toString(16);
                if (byte_string.length < 2) {
                    byte_string = "0" + byte_string;
                }
                small_ascii.push(result[n]);
                small_array.push(byte_string);
            }
            big_ascii.push(small_ascii);
            big_array.push(small_array);
        }
        createTable(big_array, line_info, big_ascii, file);
    }
}
function createTable(arr, info, ascii, file) {
    console.log(file)
    let table = document.querySelector("#tableData"), hr, hrContent;
    table.innerHTML="";
    for (let i = 0; i < arr.length; i++) {
        // 구분선
        hr = document.createElement("tr");
        table.appendChild(hr);
        hrContent = document.createElement("th");
        hrContent.colSpan = 16
        hrContent.appendChild(document.createTextNode((i+1)+") "+info[i]));
        hr.appendChild(hrContent);

        for (let j = 0; j < arr[i].length; j++) {
            let tdHex = document.createElement("td");
            let tdAscii = document.createElement("td");

            if (j % 16 == 0) {
                trHex = document.createElement("tr");
                table.appendChild(trHex);
                trAscii = document.createElement("tr");
                table.appendChild(trAscii);
            }
            tdAscii.appendChild(document.createTextNode(ascii[i][j]));
            trAscii.appendChild(tdAscii);
            tdHex.appendChild(document.createTextNode(arr[i][j]));
            trHex.appendChild(tdHex);
        }
    }
}
function exportExcel() {
    // step 1. workbook 생성
    var wb = XLSX.utils.book_new();

    // step 2. 시트 만들기 
    var newWorksheet = excelHandler.getWorksheet();

    // step 3. workbook에 새로만든 워크시트에 이름을 주고 붙인다.  
    XLSX.utils.book_append_sheet(wb, newWorksheet, excelHandler.getSheetName());

    // step 4. 엑셀 파일 만들기 
    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    // step 5. 엑셀 파일 내보내기 
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), excelHandler.getExcelFileName());
}

var excelHandler = {
    getExcelFileName: function () {
        return filename+".xlsx";	//파일명
    },
    getSheetName: function () {
        return filename;	//시트명
    },
    getExcelData: function () {
        return document.querySelector('#tableData'); 	//TABLE id
    },
    getWorksheet: function () {
        return XLSX.utils.table_to_sheet(this.getExcelData());
    }
}

function s2ab(s) {
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf);  //create uint8array as viewer
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;
}