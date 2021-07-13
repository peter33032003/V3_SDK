import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { EAPI, funcs, handleError } from './Handler';

enum SMBUSMODE{
    MODE_BYTE = 0,
    MODE_WORD = 1
}

interface Myprops {}

interface Mystate
{
    slaveAddress: number;
    selectRegister: number;
    selectMode: number;
    highByteData: number;
    lowByteData: number;
    resultStatus: string;
    outputData: string;
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
        handleError(funcs.EApiVGALibInitialize());

        this.state = {
            slaveAddress: 0x50,
            selectRegister: 0x00,
            selectMode: SMBUSMODE.MODE_BYTE,
            highByteData: 0x00,
            lowByteData: 0x00,
            resultStatus: "",
            outputData: ""
        }
    }
    
    /**
    *  Uninitialize EAPI
    */
    componentWillUnmount()
    {
        handleError(funcs.EApiLibUnInitialize());
        handleError(funcs.EApiVGALibUnInitialize());
    }
    
    onAddressSelect(e: any)
    {
        this.setState({
            slaveAddress: parseInt(e.target.value)
        });
    }

    onRegisterSelect(e: any)
    {
        this.setState({
            selectRegister: parseInt(e.target.value)
        });
    }

    onSMbusModeSelect(e: any)
    {
        this.setState({
            selectMode: parseInt(e.target.value)
        });
    }

    onInputHighSelect(e: any)
    {
        this.setState({
            highByteData: parseInt(e.target.value)
        });
    }

    onInputLowSelect(e: any)
    {
        this.setState({
            lowByteData: parseInt(e.target.value)
        });
    }

    onReadBtnClick()
    {
        const {slaveAddress, selectRegister, selectMode} = this.state;
        let addr = 0, register = 0;
        let err: number = EAPI.EAPI_STATUS_ERROR;
        let outputData: string ="", status: string = "";
        const wData = window.RefInt();


        addr = slaveAddress;
        register = selectRegister;

        if(selectMode === SMBUSMODE.MODE_BYTE)
        {
            err = funcs.EApiI2CReadTransfer(EAPI.EAPI_ID_AONCUS_SMBUS_EXTERNAL_1, addr, register, wData, 1, 1);
            if(err === EAPI.EAPI_STATUS_SUCCESS)
            {
                outputData = wData.deref().toString(16).toUpperCase().padStart(2,0);
            }
        }
        else if(selectMode === SMBUSMODE.MODE_WORD)
        {
            err = funcs.EApiI2CReadTransfer(EAPI.EAPI_ID_AONCUS_SMBUS_EXTERNAL_1, addr, register, wData, 2, 2);
            if(err === EAPI.EAPI_STATUS_SUCCESS)
            {
                outputData = wData.deref().toString(16).toUpperCase().padStart(4,0);
            }
        }
        else
        {
            window.showError("Error!", "Read Mode Error!!");
        }

        switch (err)
        {
            case EAPI.EAPI_STATUS_NOT_INITIALIZED:
                status = "STATUS_NOT_INITIALIZED";
                break;
            case EAPI.EAPI_STATUS_INVALID_PARAMETER:
                status = "STATUS_INVALID_PARAMETER";
                break;
            case EAPI.EAPI_STATUS_INVALID_BLOCK_LENGTH:
                status = "STATUS_INVALID_BLOCK_LENGTH";
                break;
            case EAPI.EAPI_STATUS_MORE_DATA:
                status = "STATUS_MORE_DATA";
                break;
            case EAPI.EAPI_STATUS_ERROR:
                status = "STATUS_ERROR";
                break;
            case EAPI.EAPI_STATUS_UNSUPPORTED:
                status = "STATUS_UNSUPPORTED";
                break;
            case EAPI.EAPI_STATUS_SUCCESS:
                status = "STATUS_SUCCESS";
                break;
            default:
                break;
        }

        this.setState({
            outputData: outputData,
            resultStatus: status
        })

    }

    onWriteBtnClick()
    {
        const {slaveAddress, selectRegister, selectMode, highByteData, lowByteData} = this.state;
        let addr = 0, register = 0;
        let err: number = EAPI.EAPI_STATUS_ERROR;
        let outputData: string ="", status: string = "";
        const wData = window.RefShort();

        addr = slaveAddress;
        register = selectRegister;
        wData[0] = highByteData;
        wData[1] = lowByteData;

        if(selectMode === SMBUSMODE.MODE_BYTE)
        {
            err = funcs.EApiI2CWriteTransfer(EAPI.EAPI_ID_AONCUS_SMBUS_EXTERNAL_1, addr, register, wData, 1);
        }
        else if(selectMode === SMBUSMODE.MODE_WORD)
        {
            err = funcs.EApiI2CReadTransfer(EAPI.EAPI_ID_AONCUS_SMBUS_EXTERNAL_1, addr, register, wData, 2);
        }
        else
        {
            window.showError("Error!", "Write Mode Error!!");
        }

        switch (err)
        {
            case EAPI.EAPI_STATUS_NOT_INITIALIZED:
                status = "STATUS_NOT_INITIALIZED";
                break;
            case EAPI.EAPI_STATUS_INVALID_PARAMETER:
                status = "STATUS_INVALID_PARAMETER";
                break;
            case EAPI.EAPI_STATUS_INVALID_BLOCK_LENGTH:
                status = "STATUS_INVALID_BLOCK_LENGTH";
                break;
            case EAPI.EAPI_STATUS_MORE_DATA:
                status = "STATUS_MORE_DATA";
                break;
            case EAPI.EAPI_STATUS_ERROR:
                status = "STATUS_ERROR";
                break;
            case EAPI.EAPI_STATUS_UNSUPPORTED:
                status = "STATUS_UNSUPPORTED";
                break;
            case EAPI.EAPI_STATUS_SUCCESS:
                status = "STATUS_SUCCESS";
                break;
            default:
                break;
        }

        this.setState({
            outputData: "",
            resultStatus: status
        })
    }

    render()
    {
        const {slaveAddress, selectRegister, selectMode, resultStatus, outputData} = this.state;
        let slaveAddresslist: any = [];
        let registerlist: any = [];
        let inputDatalist: any = [];

        let dataHighByteDisable = (selectMode === SMBUSMODE.MODE_BYTE);

        for(let i=0; i <= 0x7F ; i++){
            slaveAddresslist.push(<option value={i} key={i.toString()}> {"0x" + (i*2).toString(16).toUpperCase().padStart(2,"0")} </option>);
        }

        for(let i=0; i <= 0xFF ; i++){
            registerlist.push(<option value={i} key={i.toString()}> {"0x" + i.toString(16).toUpperCase().padStart(2,"0")} </option>);
            inputDatalist.push(<option value={i} key={i.toString()}> {"0x" + i.toString(16).toUpperCase().padStart(2,"0")} </option>);
        }
        


        return (
            <div>
                <title>smbus</title>
                <div className="content container-fluid">
                    <div className="row">
                        {/*slaveAddress*/} 
                        <div className="col-6">
                            <div className="card">
                                <div className="card-body">
                                    <div className="form-group">
                                        <label className="card-title">slave address</label>
                                        <select className="form-select" id="slaveAddress" onChange={this.onAddressSelect.bind(this)} defaultValue={slaveAddress}>
                                            {slaveAddresslist}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/*Register/Offset*/} 
                        <div className="col-6">
                            
                            <div className="card">
                                <div className="card-body">
                                    <div className="form-group">
                                        <label className="card-title">Register/Offset</label>
                                        <select className="form-select" id="Register" onChange={this.onRegisterSelect.bind(this)} defaultValue={selectRegister}>
                                            {registerlist}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {/*SMBUS_mode*/} 
                        <div className="col-6 gy-2">
                            <div className="card">
                                <div className="card-body">
                                    <div className="form-group row">
                                        <label className="card-title">Mode Select</label>
                                        
                                        {/* Byte */}                                
                                        <div className="col-6 gy-3">
                                            <div className="form-check">
                                            <input className="form-check-input" type="radio" id="offset-byte" value={SMBUSMODE.MODE_BYTE} onChange={this.onSMbusModeSelect.bind(this)} checked={selectMode === SMBUSMODE.MODE_BYTE}/>
                                                <label className="form-check-label" htmlFor="offset-byte">Byte Mode</label>
                                            </div>
                                        </div>
                                        {/* Word */}                                
                                        <div className="col-6 gy-3">
                                            <div className="form-check">
                                            <input className="form-check-input" type="radio" id="offset-word" value={SMBUSMODE.MODE_WORD} onChange={this.onSMbusModeSelect.bind(this)} checked={selectMode === SMBUSMODE.MODE_WORD}/>
                                                <label className="form-check-label" htmlFor="offset-word">Word Mode</label>
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/*input Data*/} 
                        <div className="col-6 gy-2">
                            <div className="card">
                                <div className="card-body">
                                    <div className="form-group row">
                                        <label>Input Data</label>
                                        <div className="input-group">
                                            <div className="input-group-text">0X</div>

                                            {/* High Byte */}
                                            <form className="form-floating col">
                                                <select className="form-select" id="high-byte" onChange={this.onInputHighSelect.bind(this)} defaultValue={inputDatalist} disabled={dataHighByteDisable}>
                                                    {inputDatalist}
                                                </select>
                                                <label htmlFor="high-byte">High Byte</label>
                                            </form>

                                            {/* Low Byte */}
                                            <form className="form-floating col">
                                                <select className="form-select" id="low-byte" onChange={this.onInputLowSelect.bind(this)} defaultValue={inputDatalist}>
                                                    {inputDatalist}
                                                </select>
                                                <label htmlFor="low-byte">Low Byte</label>
                                            </form>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="row">
                        {/*Result Status*/} 
                        <div className="col-6 gy-2">
                            <label>Result Status</label>
                            <input className="form-control" type="text" id="result-status" value={resultStatus} readOnly/>
                        </div>

                        {/*Output Data*/} 
                        <div className="col-6 gy-2">
                            <label>Output Data</label>
                            <input className="form-control" type="text" id="output-data" value={outputData} readOnly/>
                        </div>
                        
                    </div>

                    <div className="row">
                        {/*Read*/}
                        <div className="col-6 gy-2 d-grid mx-auto">
                            <button type="button" className="btn btn-primary col" onClick={this.onReadBtnClick.bind(this)}>Read</button>
                        </div>
                        {/*Write*/}
                        <div className="col-6 gy-2 d-grid mx-auto">
                            <button type="button" className="btn btn-primary col" onClick={this.onWriteBtnClick.bind(this)}>Write</button>
                        </div>

                    </div>

                </div>
            </div>
        );
    }

}

export default App;
