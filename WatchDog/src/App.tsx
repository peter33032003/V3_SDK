import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { EAPI, funcs, handleError } from './Handler';
import * as Progress from 'react-native-progress';
import ProgressBar from "@ramonak/react-progress-bar";


enum watchdog{
    MODE_SECOND = 0,
    MODE_MINUTE = 1,
    SET = 1,
    CLEAR = 1
}

interface Myprops {}

interface Mystate
{
    countMode: number;
    timeCount: number;
    reload: number;

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
            countMode: watchdog.MODE_SECOND,
            timeCount: 5,
            reload: 5
        }
    }

    /**
    *  Uninitialize EAPI
    */
    componentWillUnmount()
    {
        handleError(funcs.EApiLibUnInitialize());
    }
    
    onCountModeSelect(e: any){
        let countMode = 0;
        if(parseInt(e.target.value) === watchdog.MODE_SECOND){
            countMode = watchdog.MODE_SECOND;
        }
        else if(parseInt(e.target.value) === watchdog.MODE_MINUTE){
            countMode = watchdog.MODE_MINUTE;
        }
        else{
            window.showError("Error!", "Mode Error!!");
        }

        this.setState({
            countMode: countMode
        })
    }

    onTimeCountSelect(e: any){
        this.setState({
            timeCount: parseInt(e.target.value)
        })
    }

    onReloadSelect(e: any){
        this.setState({
            reload: parseInt(e.target.value)
        })
    }

    onClickSet(){

    }

    onClickClear(){

    }



    render()
    {
        const {countMode,timeCount,reload} = this.state;
        let secondCountList: any = [];
        let minuteCountList: any = [];
        let timeCountList: any = [];
        let reloadList: any = [];

        const ProgressBar = (props) => {
            return(
                <div className="progress-bar">
                    <Filler />
                </div>

            )
        }

        const Filler = (props) => {
            return(
                <div className="filler"></div>
            )
        }

        for(let i=0; i <= 0xFF ; i++){
            secondCountList.push(<option value={i} key={i.toString()}> {i.toString() + " seconds"} </option>);
            minuteCountList.push(<option value={i} key={i.toString()}> {i.toString() + " minute"} </option>);
            reloadList.push(<option value={i} key={i.toString()}> {i.toString() + " seconds"} </option>);
        }

        if(countMode === watchdog.MODE_SECOND)
            timeCountList = secondCountList;
        else if(countMode === watchdog.MODE_MINUTE)
            timeCountList = minuteCountList

        return (
            <div>
                <title>watch dog</title>
                <div className="content container-fluid">
                    <div className="row gy-1 px-1">
                        <div className="col-12">
                            {/*count mode*/}
                            <div className="card">
                                <div className="card-body">
                                    <div className="form-group">
                                        <label className="card-title">Count Mode</label>
                                        <div className="row">
                                            {/* Second */}                                
                                            <div className="col-6">
                                                <div className="form-check">
                                                <input className="form-check-input" type="radio" id="second-mode" value={watchdog.MODE_SECOND} onChange={this.onCountModeSelect.bind(this)} checked={countMode === watchdog.MODE_SECOND}/>
                                                    <label className="form-check-label" htmlFor="second-mode">Second</label>
                                                </div>
                                            </div>

                                            {/* Minute */}                                
                                            <div className="col-6">
                                                <div className="form-check">
                                                <input className="form-check-input" type="radio" id="minute-mode" value={watchdog.MODE_MINUTE} onChange={this.onCountModeSelect.bind(this)} checked={countMode === watchdog.MODE_MINUTE}/>
                                                    <label className="form-check-label" htmlFor="minute-mode">Minute</label>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-12">
                            <div className="row">
                                {/*time count*/}
                                <div className="col-6">
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="form-group">
                                                <label className="card-title">Time Count</label>
                                                <select className="form-select" id="timeCount" onChange={this.onTimeCountSelect.bind(this)} defaultValue={timeCount}>
                                                    {timeCountList}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/*reload*/}        
                                <div className="col-6">
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="form-group">
                                                <label className="card-title">Auto reload in every</label>
                                                <select className="form-select" id="reload" onChange={this.onReloadSelect.bind(this)} defaultValue={reload}>
                                                    {reloadList}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/*time*/}
                        

                        {/*set & clear*/}
                        <div className="col-12">
                            <div className="row">
                                {/*set*/}
                                <div className="col-6 gy-2 d-grid mx-auto">
                                    <button type="button" className="btn btn-primary col" onClick={this.onClickSet.bind(this)}>Set</button>
                                </div>
                                {/*clear*/}
                                <div className="col-6 gy-2 d-grid mx-auto">
                                    <button type="button" className="btn btn-primary col" onClick={this.onClickClear.bind(this)}>Clear</button>
                                </div>
                            </div>
                        </div>

                    </div>   
                </div>
            </div>
        );
    }
}


export default App;
