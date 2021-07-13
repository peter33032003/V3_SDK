import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { EAPI, funcs, handleError } from './Handler';
interface Myprops {}

interface Mystate
{
    LVDSBrightness1: number,
    LVDSBrightness2: number,
    eDPBrightness: number,
    deviceCount: number,
    eDPEnable: boolean 
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
        const err = funcs.EApiVGALibInitialize();
        const eDPEnable = (err === EAPI.EAPI_STATUS_INITIALIZED); 

        /* Get capability */
        const countRef = window.RefInt();
        handleError(funcs.EApiBKLIGHTGetCaps(countRef));
        const deviceCount = countRef.deref();

        /* Get LVDS1 brightness */
        const LVDS1Ref = window.RefInt();
        if(deviceCount >= 1)
            handleError(funcs.EApiVgaGetBacklightBrightness(EAPI.EAPI_ID_BACKLIGHT_1, LVDS1Ref));

        /* Get LVDS1 brightness */
        const LVDS2Ref = window.RefInt();
        if(deviceCount >= 2)
            handleError(funcs.EApiVgaGetBacklightBrightness(EAPI.EAPI_ID_BACKLIGHT_2, LVDS2Ref));

        /* Get eDP brightness */
        const eDPRef = window.RefInt();
        if(eDPEnable === true )
            handleError(funcs.EApiVgaGetBacklightBrightness(EAPI.EAPI_ID_BACKLIGHT_4, eDPRef));

        this.state = {
            LVDSBrightness1: LVDS1Ref.deref(),
            LVDSBrightness2: LVDS2Ref.deref(),
            eDPBrightness: eDPRef.deref(),
            deviceCount: deviceCount,
            eDPEnable: eDPEnable 
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

    onChangeLVDS1Bar(e: any){
        this.setState(
            {LVDSBrightness1: parseInt(e.target.value)},
            () => {
                const { LVDSBrightness1 } = this.state;
                handleError(funcs.EApiVgaSetBacklightBrightness(EAPI.EAPI_ID_BACKLIGHT_1, LVDSBrightness1));
            }
        )
    }

    onChangeLVDS2Bar(e: any){
        this.setState(
            {LVDSBrightness2: parseInt(e.target.value)},
            () => {
                const { LVDSBrightness2 } = this.state;
                handleError(funcs.EApiVgaSetBacklightBrightness(EAPI.EAPI_ID_BACKLIGHT_2, LVDSBrightness2));
            }
        )
    }

    onChangeeDPBar(e: any){
        this.setState(
            {eDPBrightness: parseInt(e.target.value)},
            () => {
                const { eDPBrightness } = this.state;
                handleError(funcs.EApiVgaSetBacklightBrightness(EAPI.EAPI_ID_BACKLIGHT_4, eDPBrightness));
            }
        )
    }
    
    render()
    {
        const {LVDSBrightness1, LVDSBrightness2, eDPBrightness, deviceCount, eDPEnable} = this.state;
        return (
            <div>
                <title>BackLight</title>

                <h2>Backlight</h2>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-9">
                            <label htmlFor="LVDS1Range" className="form-label">Device 1 LVDS</label>
                            <input type="range" className="form-range" min="0" max="100" step="1" id="LVDS1Range" value={LVDSBrightness1} onChange={this.onChangeLVDS1Bar.bind(this)} disabled={deviceCount < 1}></input>
                        </div>
                        <div className="col-3 gy-3">
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" value={LVDSBrightness1} onChange={this.onChangeLVDS1Bar.bind(this)} disabled/>
                                <span className="input-group-text">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-9">
                            <label htmlFor="LVDS2Range" className="form-label">Device 2 LVDS</label>
                            <input type="range" className="form-range" min="0" max="100" step="1" id="LVDS2Range" value={LVDSBrightness2} onChange={this.onChangeLVDS2Bar.bind(this)} disabled={deviceCount <= 1}></input>
                        </div>
                        <div className="col-3 gy-3">
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" value={LVDSBrightness2} onChange={this.onChangeLVDS2Bar.bind(this)} disabled/>
                                <span className="input-group-text">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-9">
                            <label htmlFor="eDPRange" className="form-label">eDP</label>
                            <input type="range" className="form-range" min="0" max="100" step="1" id="eDPRange" value={eDPBrightness} onChange={this.onChangeeDPBar.bind(this)} disabled={!eDPEnable} ></input>
                        </div>
                        <div className="col-3 gy-3">
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" value={eDPBrightness} onChange={this.onChangeeDPBar.bind(this)} disabled/>
                                <span className="input-group-text">%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        );
    }
}


export default App;
