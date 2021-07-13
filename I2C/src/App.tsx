import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { EAPI, funcs, handleError } from './Handler';

enum I2C{
    ProtocolByte = 0,
    ProtocolRaw = 1,
    ProtocolBlock = 2,
    OffsetByte = 0,
    OffsetWord = 1
}

interface Myprops {}

interface Mystate
{
    busSelection: number;
    protocol: number;
    slaveAddress: number;
    offsetType: number;
    offsetHighByte: number;
    offsetLowByte: number;
    dataLength: number;
    inputData: string;
    outputData: string;
    resultStatus: string;
}
/**
 * Convert hex string to array
 * @param hex input hexadecimal string
 * @param bytesArray output array
 * @returns length of buffer array
 */
function stringToBufferArray(hex: string, bytesArray: any): number {
    let stringArray : string[];
    let index: number = 0;
    
    stringArray = hex.replace(/\s+/g , " ").trim().split(" ");
    for(let i = 0; i < stringArray.length ; i++){
        try{
            let bytesString = parseInt(stringArray[i] , 16);
            if (Number.isNaN(bytesString) || bytesString > 0xFF){
                throw new Error("Invalid Input Number");
            }
            bytesArray[index] = bytesString;
            index++;
        }
        catch{
            index = 0;
            window.showError("Error", "Invalid Input Data!!!");
            break;
        }
    }
    return index;
}

/**
 * Encode I2C standard command
 * @param x I2C Cmd
 * @return Cmd
 */
function EAPI_I2C_ENC_STD_CMD(x: number )
{
    return ((x) & 0xFF) | (0x00 << 30);
}

/**
 * Encode I2C extend command
 * @param x I2C Cmd
 * @return Cmd
 */
function EAPI_I2C_ENC_EXT_CMD(x: number)
{
    return ((x) & 0xFFFF) | (0x02 << 30)  >>> 0;
}

class App extends React.Component<Myprops, Mystate>
{
    /**
     * Initialize EAPI
     *
     */
    constructor(props: Myprops)
    {
        super(props);
        handleError(funcs.EApiLibInitialize());

        this.state = {
            busSelection: EAPI.EAPI_ID_I2C_EXTERNAL,
            protocol: I2C.ProtocolByte,
            slaveAddress: 0x20,
            offsetType: I2C.OffsetByte,
            offsetHighByte: 0x00,
            offsetLowByte: 0x00,
            dataLength: 0x01,
            inputData: "",
            outputData: "",
            resultStatus: ""
        }

    }

    /**
    *  Uninitialize EAPI
    */
    componentWillUnmount()
    {
        handleError(funcs.EApiLibUnInitialize());
    }
    
    onBusSelection(e: any){
        let bus: number;
        switch(parseInt(e.target.value)){
            case 0:
                bus = EAPI.EAPI_ID_I2C_EXTERNAL;
                break;
                case 1:
                bus = EAPI.EAPI_ID_AONCUS_I2C_EXTERNAL_2;
                break;
            case 2:
                bus = EAPI.EAPI_ID_AONCUS_I2C_EXTERNAL_3;
                break;
            case 3:
                bus = EAPI.EAPI_ID_AONCUS_I2C_EXTERNAL_4;
                break;
            case 4:
                bus = EAPI.EAPI_ID_AONCUS_I2C_EXTERNAL_5;
                break;
            case 5:
                bus = EAPI.EAPI_ID_AONCUS_I2C_EXTERNAL_6;
                break;
            case 6:
                bus = EAPI.EAPI_ID_AONCUS_I2C_EXTERNAL_7;
                break;
            case 7:
                bus = EAPI.EAPI_ID_AONCUS_I2C_EXTERNAL_8;
                break;
            default:
                bus = 0;
                window.showError("Error", "Invalid Bus number!");
                break;
        }
        this.setState({
            busSelection: bus
        });
    }

    onChangeProtocol(e: any){
        let dataLength: number = this.state.dataLength;
        let protocolValue: number = parseInt(e.target.value);
        let offsetHighByte: number = this.state.offsetHighByte;
        let offsetLowByte: number = this.state.offsetLowByte;
        if (protocolValue === I2C.ProtocolByte)
        {
            dataLength = 1;
        }

        if (protocolValue === I2C.ProtocolRaw)
        {
            offsetHighByte = 0;
            offsetLowByte = 0;
        }

        this.setState({
            protocol: protocolValue,
            dataLength: dataLength,
            offsetHighByte: offsetHighByte,
            offsetLowByte: offsetLowByte
        });
    }

    onAddressSelect(e: any){
        this.setState({
            slaveAddress: parseInt(e.target.value) &0x7F
        });
    }

    onChangeOffsetType(e: any){
        this.setState({
            offsetType: parseInt(e.target.value)
        })
    }

    onHighByteSelect(e: any){
        this.setState({
            offsetHighByte: parseInt(e.target.value)
        });
    }

    onLowByteSelect(e: any){
        this.setState({
            offsetLowByte: parseInt(e.target.value)
        });
    }

    onDataLenSelect(e: any){
        this.setState({
            dataLength: parseInt(e.target.value)
        });
    }

    onInputDataChage(e: any){
        this.setState({
            inputData: e.target.value
        });
    }

    onReadClick(e: any){
        const { busSelection, protocol, slaveAddress, offsetType, offsetHighByte, offsetLowByte, dataLength} = this.state;
        let ret = EAPI.EAPI_STATUS_ERROR;
        let Cmd: number = 0;
        let outputString: string = "";
        let Statusstring: string = "";
        const pBuffer = window.AllocInt(128);
        
        if(offsetType === I2C.OffsetByte){
            Cmd = offsetLowByte;
            Cmd = EAPI_I2C_ENC_STD_CMD(Cmd);
        }
        if(offsetType === I2C.OffsetWord){
            Cmd = (offsetHighByte << 8) | offsetLowByte;
            Cmd = EAPI_I2C_ENC_EXT_CMD(Cmd);
        }
        //read Byte
        if(protocol === I2C.ProtocolByte){
            ret = funcs.EApiI2CReadTransfer(busSelection, slaveAddress, Cmd, pBuffer, dataLength, dataLength);
            if (ret === EAPI.EAPI_STATUS_SUCCESS)
            {
                outputString = pBuffer[0].toString(16).padStart(2, "0").toUpperCase();
            }
        }
        //read Raw
        else if(protocol === I2C.ProtocolRaw){
            ret = funcs.EApiI2CWriteReadRaw(busSelection, slaveAddress, null, 0, pBuffer, dataLength, dataLength);
            if (ret === EAPI.EAPI_STATUS_SUCCESS)
            {
                for(let i = 0 ; i < dataLength ; i++)
                    outputString = outputString + pBuffer[i].toString(16).padStart(2, "0").toUpperCase() + " ";
            }
        }
        //read block
        else if(protocol === I2C.ProtocolBlock){
            ret = funcs.EApiI2CReadTransfer(busSelection, slaveAddress, Cmd, pBuffer, dataLength, dataLength);
            if (ret === EAPI.EAPI_STATUS_SUCCESS)
            {
                for(let i = 0 ; i < dataLength ; i++)
                    outputString = outputString + pBuffer[i].toString(16).padStart(2, "0").toUpperCase() + " ";
            }
        }
        else
        {
            window.showError("Error", "Please choose a Protocol.");
        }

        switch (ret)
            {
                case EAPI.EAPI_STATUS_NOT_INITIALIZED:
                    Statusstring = "STATUS_NOT_INITIALIZED!!";
                    break;
                case EAPI.EAPI_STATUS_INVALID_PARAMETER:
                    Statusstring = "STATUS_INVALID_PARAMETER!!";
                    break;
                case EAPI.EAPI_STATUS_INVALID_BLOCK_LENGTH:
                    Statusstring = "STATUS_INVALID_BLOCK_LENGTH!!";
                    break;
                case EAPI.EAPI_STATUS_MORE_DATA:
                    Statusstring = "STATUS_MORE_DATA!!";
                    break;
                case EAPI.EAPI_STATUS_ERROR:
                    Statusstring = "STATUS_ERROR!!";
                    break;
                case EAPI.EAPI_STATUS_UNSUPPORTED:
                    Statusstring = "STATUS_UNSUPPORTED!!";
                    break;
                case EAPI.EAPI_STATUS_SUCCESS:
                    Statusstring = "STATUS_SUCCESS!!";
                    break;
                default:
                    break;
            }
        
        this.setState({
            resultStatus: Statusstring,
            outputData: outputString
        });
        
    }

    onWriteClick(e: any){
        const { busSelection, protocol, slaveAddress, offsetType, offsetHighByte, offsetLowByte, dataLength, inputData} = this.state;
        let ret = EAPI.EAPI_STATUS_ERROR;
        let Cmd: number = 0;
        let Statusstring: string = "";
        const pBuffer = window.AllocInt(128);
        let str: string = "";
        let OutPutNull: string = "";
        let dataCount: number = 0;
        let writeDataLength: number = 0;
        
        if(offsetType === I2C.OffsetByte){
            Cmd = offsetLowByte;
            Cmd = EAPI_I2C_ENC_STD_CMD(Cmd);
        }
        if(offsetType === I2C.OffsetWord){
            Cmd = (offsetHighByte << 8) | offsetLowByte;
            Cmd = EAPI_I2C_ENC_EXT_CMD(Cmd);
        }

        dataCount = stringToBufferArray(inputData, pBuffer)
        if(dataCount !== 0)
        {
            writeDataLength = dataLength;
        }

        for (let i = 0; i < writeDataLength; i++) 
        {
            str = str + pBuffer[i].toString(16).padStart(2, "0").toUpperCase() + " ";
        }

        //write Byte
        if(protocol === I2C.ProtocolByte){
            ret = funcs.EApiI2CWriteTransfer(busSelection, slaveAddress, Cmd, pBuffer, writeDataLength);
        }
        //write Raw
        else if(protocol === I2C.ProtocolRaw){
            ret = funcs.EApiI2CWriteReadRaw(busSelection, slaveAddress, pBuffer, writeDataLength, null, 0 ,0);
        }
        //write Block
        else if(protocol === I2C.ProtocolBlock){
            ret = funcs.EApiI2CWriteTransfer(busSelection, slaveAddress, Cmd, pBuffer, writeDataLength);
        }
        else{
            window.showError("Error", "Please choose a Protocol.");
        }

        switch (ret)
        {
            case EAPI.EAPI_STATUS_NOT_INITIALIZED:
                Statusstring = "STATUS_NOT_INITIALIZED!!";
                break;
            case EAPI.EAPI_STATUS_INVALID_PARAMETER:
                Statusstring = "STATUS_INVALID_PARAMETER!!";
                break;
            case EAPI.EAPI_STATUS_INVALID_BLOCK_LENGTH:
                Statusstring = "STATUS_INVALID_BLOCK_LENGTH!!";
                break;
            case EAPI.EAPI_STATUS_MORE_DATA:
                Statusstring = "STATUS_MORE_DATA!!";
                break;
            case EAPI.EAPI_STATUS_ERROR:
                Statusstring = "STATUS_ERROR!!";
                break;
            case EAPI.EAPI_STATUS_UNSUPPORTED:
                Statusstring = "STATUS_UNSUPPORTED!!";
                break;
            case EAPI.EAPI_STATUS_SUCCESS:
                Statusstring = "STATUS_SUCCESS!!";
                break;
            default:
                break;
        }

        this.setState({
            inputData: str,
            resultStatus: Statusstring,
            outputData: OutPutNull
        });

    }

    

    render()
    { 
        const { busSelection, protocol, slaveAddress, offsetType, offsetHighByte, offsetLowByte, dataLength, inputData, outputData,  resultStatus } = this.state;
        const buslist: any = [];
        const addresslist: any = [];
        const offsetlist: any = [];
        const datalenlist: any = [];

        for(let i = 0 ; i < 8 ; i++)
        {
            buslist.push(<option value={i}>{"I2C Bus "+i}</option>)
        }

        for(let i = 0 ; i <= 0x7F; i++)
        {
            addresslist.push(<option value={i}>{"0x"+ (i * 2).toString(16).toUpperCase().padStart(2,"0")}</option>)
        }

        for(let i = 0 ; i <= 0xFF; i++)
        {
            offsetlist.push(<option value={i}>{(i).toString(16).toUpperCase().padStart(2,"0")}</option>)
        }

        for(let i = 1 ; i <= 64; i++)
        {
            datalenlist.push(<option value={i}>{(i).toString().toUpperCase().padStart(2,"0")}</option>)
        }

        const disOffsetByte = I2C.ProtocolRaw === protocol;
        const disOffsetWord = I2C.ProtocolRaw === protocol;
        const disOffsetHigh = I2C.ProtocolRaw === protocol || (offsetType === I2C.OffsetByte && protocol !== I2C.ProtocolRaw);
        const disOffsetLow = I2C.ProtocolRaw === protocol;
        const disDataLen = I2C.ProtocolByte === protocol;

        return (
            <div>
                <title>I2C</title>
                <div className="content container-fluid">
                    <div className="row">
                        <div className="col-5">
                            <div className="row">
                                {/*Bus Selection*/}
                                <div className="col-12 gy-1">
                                    <div className="card">
                                        <div className="card-body">
                                            <label className="card-title">Bus Selection</label>
                                            <select className="form-select" onChange={this.onBusSelection.bind(this)} defaultValue={busSelection}>
                                                {buslist}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/*Protocol*/}
                                <div className="col-12 gy-3">
                                    <div className="card">
                                        <div className="card-body">
                                            <label className="card-title">Protocol</label>
                                            {/*Read/Write Byte*/}
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" id="ProtocolByte" value={I2C.ProtocolByte} onChange={this.onChangeProtocol.bind(this)} checked={protocol === I2C.ProtocolByte}/>
                                                <label className="form-check-label" htmlFor="ProtocolByte">Read/Write Byte</label>
                                            </div>
                                            {/*Read/Write Raw*/}
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" id="ProtocolRaw" value={I2C.ProtocolRaw} onChange={this.onChangeProtocol.bind(this)} checked={protocol === I2C.ProtocolRaw}/>
                                                <label className="form-check-label" htmlFor="ProtocolRaw">Read/Write Raw</label>
                                            </div>
                                            {/*Read/Write Block*/}
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" id="ProtocolBlock" value={I2C.ProtocolBlock} onChange={this.onChangeProtocol.bind(this)} checked={protocol === I2C.ProtocolBlock}/>
                                                <label className="form-check-label" htmlFor="ProtocolBlock">Read/Write Block</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-7 gy-1">
                            <div className="card">
                                <div className="card-body">
                                    {/*Slave Address*/}
                                    <label className="card-title">Slave Address</label>
                                    <select className="form-select" onChange={this.onAddressSelect.bind(this)} defaultValue={slaveAddress}>
                                        {addresslist}
                                    </select>
                                    <div className="row">
                                        <div className="col-12 gy-2">
                                            <label className="card-title">Offset Type</label>
                                        </div>
                                        {/*Offset BYTE*/}
                                        <div className="col-6 ">
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" id="OffsetByte" value={I2C.ProtocolByte} onChange={this.onChangeOffsetType.bind(this)} checked={offsetType === I2C.OffsetByte} disabled={disOffsetByte}/>
                                                <label className="form-check-label" htmlFor="OffsetByte">BYTE</label>
                                            </div>
                                        </div>
                                        {/*Offset WORD*/}
                                        <div className="col-6">        
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" id="OffsetWord" value={I2C.ProtocolRaw} onChange={this.onChangeOffsetType.bind(this)} checked={offsetType === I2C.OffsetWord} disabled={disOffsetWord}/>
                                                <label className="form-check-label" htmlFor="OffsetWord">WORD</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12 gy-2">
                                            <label className="card-title">Offset/Register</label>
                                            <div className="input-group">
                                            <span className="input-group-text">0x</span>
                                                {/*High Byte*/}
                                                <div className="form-floating col">
                                                    <select className="form-select" id="offset-high" value={offsetHighByte} onChange={this.onHighByteSelect.bind(this)} disabled={disOffsetHigh}>
                                                        {offsetlist}
                                                    </select>
                                                    <label htmlFor="offset-high">High Byte</label>
                                                </div>
                                                {/*Low Byte*/}
                                                <div className="form-floating col">
                                                    <select className="form-select" id="offset-low" value={offsetLowByte} onChange={this.onLowByteSelect.bind(this)} disabled={disOffsetLow}>
                                                        {offsetlist}
                                                    </select>
                                                    <label htmlFor="offset-low">Low Byte</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                     {/*Data Length*/}
                                     <div className="row">
                                        <div className="col-12 gy-2">
                                            <label className="card-title">Data Length</label>
                                            <select className="form-select" value={dataLength} onChange={this.onDataLenSelect.bind(this)} disabled={disDataLen}>
                                                {datalenlist}
                                            </select>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*Input Data*/}
                    <div className="row">
                        <div className="col-12">
                            <label className="card-title">Input Data:</label>
                            <div className="input-group">
                                <span className="input-group-text">0x</span>
                                <input className="form-control" type="text" value={inputData} onChange={this.onInputDataChage.bind(this)}></input>
                            </div>
                        </div>
                    </div>
                    
                    {/*Output Data*/}
                    <div className="row">
                        <div className="col-12 gy-2">
                            <label className="card-title">Output Data:</label>
                            <div className="input-group">
                                <span className="input-group-text">0x</span>
                                <input className="form-control" type="text" value={outputData} readOnly></input >
                            </div>
                        </div>
                    </div>
                    
                    {/*Result Status*/}
                    <div className="row">
                        <div className="col-12 gy-2">
                            <label className="card-title">Result Status:</label>
                            <input className="form-control" type="text" value={resultStatus} readOnly></input>
                        </div>
                    </div>

                    <div className="row">
                        {/*Read*/}
                        <div className="col-6 gy-2">
                            <div className="d-grid gap-2">
                                <button type="button" className="btn btn-primary col" onClick={this.onReadClick.bind(this)}>Read</button>
                            </div>
                        </div>
                        {/*Write*/}
                        <div className="col-6  gy-2">
                            <div className="d-grid gap-2">
                                <button type="button" className="btn btn-primary col" onClick={this.onWriteClick.bind(this)}>Write</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}


export default App;
