import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import'@fortawesome/fontawesome-free/css/all.css';
import { EAPI, funcs, handleError } from './Handler';

enum DIO{
    INPUT = 0x01,
    OUTPUT = 0x00,
    HIGH = 0x01,
    LOW = 0x00,
    UNKNOWN = 0xff
};

interface Myprops {}

interface Mystate
{
    curMode: number[],
    curValue: number[],
    setMode: number[],
    setValue: number[],
    totalPinCount: number,
    selectGroup: number,
    totalGroups:number
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

        const nPinCount = window.RefInt();
        const bDioDisable = window.RefInt();
        let curMode = [DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN];
        let curValue = [DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN];
        let setMode = [DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN];
        let setValue = [DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN];
        let totalGroups = 1;
        let selectGroup = 1;
        let nUIPinCount : number;

        /* Initialize */
        handleError(funcs.EApiLibInitialize());
        // Get Dio Capability
        handleError(funcs.EApiGPIOGetCaps(0, nPinCount, bDioDisable)); 

        if(nPinCount.deref() > 8)
        {
            nUIPinCount = 8;
            totalGroups = Math.ceil( nPinCount.deref() / 8);
        }
        else
        {
            nUIPinCount = nPinCount.deref();
        }

        for(let i = 0; i < nUIPinCount ; i++)
        {
            handleError(funcs.EApiGPIOGetCaps(i, nPinCount, bDioDisable));
            if( bDioDisable.deref() !== 1)
            {
                curMode[i] = this.getDIOPinMode(selectGroup, i);
                curValue[i] = this.getDIOPinValue(selectGroup, i);
            }
        }

        setMode = curMode.slice();
        setValue = curValue.slice();

        this.state= {
            curMode: curMode,
            curValue: curValue,
            setMode: setMode,
            setValue: setValue,
            totalPinCount: nPinCount.deref(),
            selectGroup: selectGroup,
            totalGroups: totalGroups
        }
    }

    /**
    *  Uninitialize EAPI
    */
    componentWillUnmount()
    {
        handleError(funcs.EApiLibUnInitialize());
    }

    setDioStatus()
    {
        const {totalPinCount, selectGroup, totalGroups, setMode, setValue} = this.state;
        const nPinCount = window.RefInt();
        const bDioDisable = window.RefInt();
        let nUIPinCount: number;
        
        if((totalPinCount %8 !== 0) && (selectGroup === totalGroups))
            nUIPinCount = totalPinCount%8
        else
            nUIPinCount = 8;
        
        for(let i = 0 ; i < nUIPinCount ; i++)
        {
            handleError(funcs.EApiGPIOGetCaps(i, nPinCount, bDioDisable));
            if( bDioDisable.deref() === 0)
            {
                handleError(funcs.EApiGPIOSetDirection(i + 8 * (selectGroup - 1), 0xFFFFFFFF, setMode[i]))
                handleError(funcs.EApiGPIOSetLevel(i + 8 * (selectGroup - 1), 0xFFFFFFFF, setValue[i]))
            }
        }

        this.getDioState();
    }

    getDioState()
    {
        const {totalPinCount, selectGroup, totalGroups} = this.state;
        const nPinCount = window.RefInt();
        const bDioDisable = window.RefInt();
        let curMode = [DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN];
        let curValue = [DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN, DIO.UNKNOWN];
        let nUIPinCount: number;

        if((totalPinCount %8 !== 0) && (selectGroup === totalGroups))
            nUIPinCount = totalPinCount%8
        else
            nUIPinCount = 8;

        for(let i = 0 ; i < nUIPinCount ; i++)
        {
            handleError(funcs.EApiGPIOGetCaps(i, nPinCount, bDioDisable));
            if( bDioDisable.deref()  === 0)
            {
                curMode[i] = this.getDIOPinMode(selectGroup, i);
                curValue[i] = this.getDIOPinValue(selectGroup, i);
            
            }
        }
        this.setState( () => {
            return{
                curMode: curMode,
                curValue: curValue
            };
        })

    }

    getDIOPinMode(selectGroup: number, Pin: number)
    {
        const mode = window.RefInt();

        const err = funcs.EApiGPIOGetDirection(Pin + 8 * (selectGroup - 1), 0xFFFFFFFF, mode)
        handleError(err);
        if(err === EAPI.EAPI_STATUS_SUCCESS)
        {
            if (mode.deref() === 1)
                return DIO.INPUT;
            else
                return DIO.OUTPUT;
        }
        return DIO.UNKNOWN;
    }

    getDIOPinValue(selectGroup: number, Pin: number)
    {
        const Value = window.RefInt();

        const err = funcs.EApiGPIOGetLevel(Pin + 8 * (selectGroup - 1), 0xFFFFFFFF, Value)
        handleError(err);
        if(err === EAPI.EAPI_STATUS_SUCCESS)
        {
            if (Value.deref() === 1)
                return DIO.HIGH;
            else
                return DIO.LOW;
        }
        return DIO.UNKNOWN;
    }

    groupSelect(e: any) {
        let group = e.target.value;
        this.setState(
            {selectGroup: parseInt(group)},
            this.getDioState
        );
    }

    onChangeMode(e : any)
    {
        const {setMode} = this.state;
        let selectPin: number = 8;
        let nSetMode = setMode;
        if(e.target.id === "OUT0" || e.target.id === "IN0")
            selectPin = 0;
        else if(e.target.id === "OUT1" || e.target.id === "IN1")
            selectPin = 1;
        else if(e.target.id === "OUT2" || e.target.id === "IN2")
            selectPin = 2;
        else if(e.target.id === "OUT3" || e.target.id === "IN3")
            selectPin = 3;
        else if(e.target.id === "OUT4" || e.target.id === "IN4")
            selectPin = 4;
        else if(e.target.id === "OUT5" || e.target.id === "IN5")
            selectPin = 5;
        else if(e.target.id === "OUT6" || e.target.id === "IN6")
            selectPin = 6;
        else if(e.target.id === "OUT7" || e.target.id === "IN7")
            selectPin = 7;
        
        if(selectPin < 8)
        {
            if(e.target.value === "Output")
                nSetMode[selectPin] = DIO.OUTPUT;
            else if(e.target.value === "Input")
                nSetMode[selectPin] = DIO.INPUT;
        }
        this.setState({setMode: nSetMode});
    }

    onChangValue(e: any)
    {
        const {setValue} = this.state;
        let selectPin: number = 8;
        let nSetValue = setValue;
        if(e.target.id === "Low0" || e.target.id === "High0")
            selectPin = 0;
        else if(e.target.id === "Low1" || e.target.id === "High1")
            selectPin = 1;
        else if(e.target.id === "Low2" || e.target.id === "High2")
            selectPin = 2;
        else if(e.target.id === "Low3" || e.target.id === "High3")
            selectPin = 3;
        else if(e.target.id === "Low4" || e.target.id === "High4")
            selectPin = 4;
        else if(e.target.id === "Low5" || e.target.id === "High5")
            selectPin = 5;
        else if(e.target.id === "Low6" || e.target.id === "High6")
            selectPin = 6;
        else if(e.target.id === "Low7" || e.target.id === "High7")
            selectPin = 7;
        
        if(selectPin < 8)
        {
            if(e.target.value === "Low")
                nSetValue[selectPin] = DIO.LOW;
            else if(e.target.value === "High")
                nSetValue[selectPin] = DIO.HIGH;
        }
        this.setState({setValue: nSetValue});
    }

    render()
    {
        const {curMode, curValue, setMode, setValue, totalPinCount, selectGroup, totalGroups}= this.state
        const optionList: any = [];
        const groupList: any = [];
        const formList: any = [];
        const curModeList: any = [];
        const curValueList: any = [];
        const dioName: any = [];
        let maxDisplayDioCount: number;

        for (let i = 0; i < totalGroups; i++)
        {
            optionList.push(<option value={(i+1)} key={i.toString()}> {"Dio"+ (i*8+1) + "~" + (i+1)*8} </option>)
        }
        groupList.push(<select className="form-select" key={totalGroups} onChange={this.groupSelect.bind(this)}> {optionList} </select>);
        
        if ((totalPinCount % 8 !== 0) && (selectGroup === totalGroups))
        {
            maxDisplayDioCount = totalPinCount % 8; 
        }
        else
        {
            maxDisplayDioCount = 8;
        }

        for (let i = 0; i < 8; i++)
        {
            if (i < maxDisplayDioCount)
            {
                dioName[i] = "DIO " + (8 * (selectGroup - 1) + i + 1);
            }
            else
            {
                dioName[i] = "";
            }
        }

        for(let i = 0 ; i < 8 ; i++)
        {
            if(curMode[i] === DIO.INPUT)
            {
                curModeList.push(
                    <i className="fas fa-sign-in-alt fa-rotate-180" style={{color: "#00F"}}></i>
                );
            }
            else if(curMode[i] === DIO.OUTPUT)
            {
                curModeList.push(
                    <i className="fas fa-sign-out-alt fa-rotate-180" style={{color: "#F00"}}></i>
                );
            }
            if(curValue[i] === DIO.HIGH)
            {
                curValueList.push(
                    <span className="badge rounded-pill bg-light" style={{color: "rgb(10, 184, 253)"}}>High</span>
                );
            }
            else if(curValue[i] === DIO.LOW)
            {
                curValueList.push(
                    <span className="badge rounded-pill bg-light" style={{color: "rgb(0, 255, 0)"}}>Low</span>
                );
            }
        }

        for(let i = 0 ; i < 8 ; i++)
        {
            formList.push
            (
                <tr className="text-center">
                    {/* Dio Name */}
                    <th>{dioName[i]}</th>

                    {/* Current Mode */}
                    <td>{curModeList[i]}</td> 

                    {/* Current Value */}
                    <td>{curValueList[i]} </td> 

                    {/* Setting Mode */}
                    <td>       
                        <div className="form-check form-check-inline">
                            <input  className="form-check-input Output-control-input" type="radio" value="Output" id={"OUT"+i} onChange={this.onChangeMode.bind(this)} checked={setMode[i] === DIO.OUTPUT}/>
                            <label className="form-check-label" htmlFor={"OUT"+i}>Output</label>
                        </div>
                        <div className="form-check-inline">
                            <input className="form-check-input Input-control-input" type="radio" value="Input" id={"IN"+i} onChange={this.onChangeMode.bind(this)} checked={setMode[i] === DIO.INPUT}/>
                            <label className="form-check-label" htmlFor={"IN"+i}>Input</label>
                        </div>
                    </td>

                    {/* Setting Value */}
                    <td>  
                        <div className="form-check-inline">
                            <input className="form-check-input Low-control-input" type="radio" value="Low" id={"Low"+i} onChange={this.onChangValue.bind(this)} checked={setValue[i] === DIO.LOW}/>
                            <label className="form-check-label" htmlFor={"Low"+i}>Low</label>
                        </div>
                        <div className="form-check-inline">
                            <input className="form-check-input High-control-input" type="radio" value="High" id={"High"+i} onChange={this.onChangValue.bind(this)} checked={setValue[i] === DIO.HIGH} />
                            <label className="form-check-label" htmlFor={"High"+i}>High</label>
                        </div>
                    </td>
                </tr>
            );
        }

        return (
            <div>
                <h2>Digital I/O</h2>
                
                <div className="row">
                    <div className="col-6">
                        <select className="form-select" >
                        <option selected>Group 1</option>
                            {groupList}
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="col align-self-center">
                        <table className="table table-striped table-bordered border-dark">
                            <thead>
                                <tr className="text-center">
                                    <th>Name</th>
                                    <th>Current Mode</th>
                                    <th>Current Value</th>
                                    <th>Setting Mode</th>
                                    <th>Setting Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formList}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="row">
                    {/* Set Button */}
                    <div className="col-6">
                        <div className="d-grid gap-2 col-6 mx-auto">
                            <button type="button" className="btn btn-primary" onClick={this.setDioStatus.bind(this)}>Set</button>
                        </div>
                    </div>
                    <div className="col">
                    {/* Refresh Button */}
                    <div className="d-grid gap-2 col-6 mx-auto">
                            <button type="button" className="btn btn-info" onClick={this.getDioState.bind(this)} >Refresh</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
