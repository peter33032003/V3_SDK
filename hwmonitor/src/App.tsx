import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { EAPI, funcs, handleError } from './Handler';


enum HWMON {
    DISABLE = 0x0,
    ENABLE = 0x1,
    UPDATE_PERIOD = 1000,
};

interface Myprops {}

interface Mystate {
    SIOCount: (number);
    fanSpeed: (number | string)[];
    temperature: (number | string)[];
    voltage: (number | string)[];
}

/**
 * convert temperature from kelvin to celsius
 * @param celsius
 */
function DecodeKelvin(kelvin: any)
{
    return ((kelvin) - EAPI.EAPI_KELVINS_OFFSET) / 10;
}

class App extends React.Component<Myprops, Mystate> {
    
    private timerId: any = 0;
    /**
     * Initialize EAPI
     *
     */
    constructor(props: Myprops) {
        super(props);
        handleError(funcs.EApiLibInitialize());

        const SIOCounts: number = 1;
        const fanSpeeds: (number | string)[] = ["", "", ""];
        const temperatures: (number | string)[] = ["", "", ""];
        const voltages: (number | string)[] = ["", "", "", "", "", "", "", "", ""];

        this.getMonitorStatus(fanSpeeds, temperatures, voltages);

        this.state = {
            SIOCount: SIOCounts,
            fanSpeed: fanSpeeds,
            temperature: temperatures,
            voltage: voltages
        };
    }

    

    /**
     *  Update Monitor
     */
    updateMonitor() {
        const SIOCounts: number = 1;
        const fanSpeeds: (number | string)[] = ["", "", ""];
        const temperatures: (number | string)[] = ["", "", ""];
        const voltages: (number | string)[] = ["", "", "", "", "", "", "", "", ""];

        this.getMonitorStatus(fanSpeeds, temperatures, voltages);
        this.getSIOCount(SIOCounts);

        this.setState({
            SIOCount: SIOCounts,
            fanSpeed: fanSpeeds,
            temperature: temperatures,
            voltage: voltages
        });
    }

    /**
     *  Get Monitor Value
     * @param fanSpeed the array that returns fanspeed
     * @param temperature the array that returns temperature
     * @param voltage the array that returns voltage
     */
    getMonitorStatus(fanSpeed: (number | string)[], temperature: (number | string)[], voltage: (number | string)[]) {
        this.getFanSpeedValue(fanSpeed);
        this.getTemperatureValue(temperature);
        this.getVoltageValue(voltage);
    }

    /**
     *  Get Fan Speed Value
     */
    getFanSpeedValue(fanSpeed: (number | string)[]) {
        const speedRef = window.RefInt();

        for (let i = 0; i < 3; i++)
        {
            if (this.getMonitorCaps(EAPI.EAPI_ID_HWMON_FAN_CPU, i) === HWMON.ENABLE)
            {
                handleError(funcs.EApiBoardGetValue(EAPI.EAPI_ID_HWMON_FAN_CPU + i, speedRef));
                fanSpeed[i] = speedRef.deref();
            }
            else {
                fanSpeed[i] = "";
            }
        }
    }

    /**
     *  Get Temperature Value
     */
    getTemperatureValue(temperature: (number | string)[]) {
        const tempRef = window.RefInt();

        for (let i = 0; i < 3; i++)
        {
            if (this.getMonitorCaps(EAPI.EAPI_ID_HWMON_CPU_TEMP, i) === HWMON.ENABLE)
            {
                handleError(funcs.EApiBoardGetValue(EAPI.EAPI_ID_HWMON_CPU_TEMP + i, tempRef));
                temperature[i] = DecodeKelvin(tempRef.deref());
            }
            else {
                temperature[i] = "";
            }
        }
    }

    /**
     *  Get Voltage Value
     */
    getVoltageValue(voltage: (number | string)[]) {
        const voltRef = window.RefInt();

        for (let i = 0; i < 9; i++)
        {
            if (this.getMonitorCaps(EAPI.EAPI_ID_HWMON_VOLTAGE_VCORE, i * 4) === HWMON.ENABLE)
            {
                handleError(funcs.EApiBoardGetValue(EAPI.EAPI_ID_HWMON_VOLTAGE_VCORE + i * 4, voltRef));
                voltage[i] = voltRef.deref();
            }
            else {
                voltage[i] = "";
            }
        }
    }

    /**
     * Get Monitor capability
     * @param EAPI_ID Monitor EAPI ID
     * @param index Monitor index
     */
    getMonitorCaps(EAPI_ID:number, index: number): number {
        
        const bFanEnable = window.RefInt();
        const bTempEnable = window.RefInt();
        const bVoltEnable = window.RefInt();
        const err = funcs.EApiHWMONGetCaps(EAPI_ID + index, bFanEnable, bTempEnable, bVoltEnable);
        handleError(err);
        if (err === EAPI.EAPI_STATUS_SUCCESS)
        {
            let enable;
            if (EAPI_ID === EAPI.EAPI_ID_HWMON_FAN_CPU)
            {
                enable = bFanEnable;
            }
            else if (EAPI_ID === EAPI.EAPI_ID_HWMON_CPU_TEMP)
            {
                enable = bTempEnable;
            }
            else if (EAPI_ID === EAPI.EAPI_ID_HWMON_VOLTAGE_VCORE)
            {
                enable = bVoltEnable;
            }

            if (enable.deref() === HWMON.DISABLE)
                return HWMON.DISABLE;
            else 
                return HWMON.ENABLE;
        }
        return HWMON.DISABLE;
    }
    
    /** 
     *  Get SIO Count
    */
     getSIOCount(SIOCount: number){
        const SIOCountRef = window.RefInt();
        handleError(funcs.EApiBoardGetValue(EAPI.EAPI_ID_AONCUS_HISAFE_SIOCOUNT, SIOCountRef));
        SIOCount = SIOCountRef;
    }

    /**
     *  Start Timer
     */
    componentDidMount() {
        const err = funcs.EApiLibInitialize();
        handleError(err);
        if (err === EAPI.EAPI_STATUS_INITIALIZED)
        {    
            /* Set up Timer */
            this.timerId = setInterval(this.updateMonitor.bind(this), HWMON.UPDATE_PERIOD);
        }
        /* Disable Monitor */
        this.AllMonitorEnableControl();
    }

    /**
     * 
     */
    AllMonitorEnableControl() {
        const speedElement = [document.getElementById("speed-cpu"), document.getElementById("speed-chipset"), document.getElementById("speed-system")];
        const tempElement = [document.getElementById("temp-cpu"), document.getElementById("temp-chipset"), document.getElementById("temp-system")];
        const voltageElement = [document.getElementById("voltage-vcore"), document.getElementById("voltage-1v8"), document.getElementById("voltage-3v3"), document.getElementById("voltage-vbat"), document.getElementById("voltage-5v"), document.getElementById("voltage-5vsb"), document.getElementById("voltage-12v"), document.getElementById("voltage-dimm"), document.getElementById("voltage-3vsb")];

        const speedTitleElement = [document.getElementById("speed-cpu-title"), document.getElementById("speed-chipset-title"), document.getElementById("speed-system-title")];
        const tempTitleElement = [document.getElementById("temp-cpu-title"), document.getElementById("temp-chipset-title"), document.getElementById("temp-system-title")];
        const voltageTitleElement = [document.getElementById("voltage-vcore-title"), document.getElementById("voltage-1v8-title"), document.getElementById("voltage-3v3-title"), document.getElementById("voltage-vbat-title"), document.getElementById("voltage-5v-title"), document.getElementById("voltage-5vsb-title"), document.getElementById("voltage-12v-title"), document.getElementById("voltage-dimm-title"), document.getElementById("voltage-3vsb-title")];

        /* Fan */
        for (let i = 0; i < 3; i++)
        {
            this.monitorElementEnableControl(speedElement[i], speedTitleElement[i], this.getMonitorCaps(EAPI.EAPI_ID_HWMON_FAN_CPU, i));
        }

        /* Temperature */
        for (let i = 0; i < 3; i++)
        {
            this.monitorElementEnableControl(tempElement[i], tempTitleElement[i], this.getMonitorCaps(EAPI.EAPI_ID_HWMON_CPU_TEMP, i));
        }

        /* Voltage */
        for (let i = 0; i < 9; i++)
        {
            this.monitorElementEnableControl(voltageElement[i], voltageTitleElement[i], this.getMonitorCaps(EAPI.EAPI_ID_HWMON_VOLTAGE_VCORE, i * 4));
        }
    }

    /**
     *  Disable the Monitor
     */
    monitorElementEnableControl(monitorElement: HTMLElement | null, titleElement: HTMLElement | null, enable: number) {
        if (enable === HWMON.ENABLE)
        {
            monitorElement?.classList.remove('input-disabled');
            titleElement?.classList.remove('input-disabled');
        }
        else 
        {
            monitorElement?.classList.add('input-disabled');
            titleElement?.classList.add('input-disabled');
        }
    }

    /**
    *  Uninitialize EAPI
    */
    componentWillUnmount() {
        handleError(funcs.EApiLibUnInitialize());        
        clearInterval(this.timerId);
    }
    
    render() {
        let {SIOCount, fanSpeed, temperature, voltage } = this.state;
        let SIOFanTab: any = [];
        let SIOTamperatureTab: any = [];
        SIOCount = 1;
        if (SIOCount > 1)
        {
            SIOFanTab.push(<ul className="nav nav-tabs bg-light " role="tablist">
                            <li className="nav-item">
                                <a className="nav-link text-dark active" data-bs-toggle="tab" href="#SpeedPage1"><b>Page1</b></a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-dark" data-bs-toggle="tab" href="#SpeedPage2"><b>Page2</b></a>
                            </li>
                        </ul>  );

            SIOTamperatureTab.push(<ul className="nav nav-tabs bg-light" role="tablist">
                                        <li className="nav-item">
                                            <a className="nav-link text-dark active" data-bs-toggle="tab" href="#TamperaturePage1"><b>Page1</b></a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link text-dark" data-bs-toggle="tab" href="#TamperaturePage2"><b>Page2</b></a>
                                        </li>
                                    </ul>  );
        }

        return (
            <div>
                <div className="content">

                    {/* Title */}
                    <nav>
                        <div className="breadcrumb list-inline menu-left page-header-title">
                            <h2 className="breadcrumb-item active page-title">H/W Monitor</h2>
                        </div>
                    </nav>

                    {/* Panel */}
                    <div className="container-fluid">
                        <div className="row">

                            {/* Fan Speed */}
                            <div className="col-sm-6">
                                <div className="card text-muted h-100">
                                    <div className="card-body">
                                        <div className="cardtitle">
                                            <div className="col-12">                                            
                                                <div className="text h5">Fan Speed</div>
                                            </div>
                                            <div className="col-sm-12">
                                                {SIOFanTab}
                                                <div className="tab-content">
                                                    <div id="SpeedPage1" className="tab-pane active">
                                                        <ul>
                                                            {/* CPU */}
                                                            <div className="col-sm-12">
                                                                <div className="form-group">
                                                                    <label id="speed-cpu-title">CPU</label>
                                                                    <div id="speed-cpu" className="input-group">
                                                                        <input type="text" className="form-control" value={fanSpeed[0]} readOnly />
                                                                        <span className="input-group-text">RPM</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* Chipset */}
                                                            <div className="col-sm-12">
                                                                <div className="form-group">
                                                                    <label id="speed-chipset-title">Chipset</label>
                                                                    <div id="speed-chipset" className="input-group">
                                                                        <input type="text" className="form-control" value={fanSpeed[1]} readOnly />
                                                                        <span className="input-group-text">RPM</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* System */}
                                                            <div className="col-sm-12">
                                                                <div className="form-group">
                                                                    <label id="speed-system-title">System</label>
                                                                    <div id="speed-system" className="input-group">
                                                                        <input type="text" className="form-control" value={fanSpeed[2]} readOnly />
                                                                        <span className="input-group-text">RPM</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </ul>
                                                    </div>
                                                    <div id="SpeedPage2" className="tab-pane fade">
                                                        <ul>
                                                            {/* System */}
                                                            <div className="col-sm-12">
                                                                <div className="form-group">
                                                                    <label id="speed-cpu-title">System</label>
                                                                    <div id="speed-cpu" className="input-group">
                                                                        <input type="text" className="form-control" value={fanSpeed[0]} readOnly />
                                                                        <span className="input-group-text">RPM</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* System */}
                                                            <div className="col-sm-12">
                                                                <div className="form-group">
                                                                    <label id="speed-chipset-title">System</label>
                                                                    <div id="speed-chipset" className="input-group">
                                                                        <input type="text" className="form-control" value={fanSpeed[1]} readOnly />
                                                                        <span className="input-group-text">RPM</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* System */}
                                                            <div className="col-sm-12">
                                                                <div className="form-group">
                                                                    <label id="speed-system-title">System</label>
                                                                    <div id="speed-system" className="input-group">
                                                                        <input type="text" className="form-control" value={fanSpeed[2]} readOnly />
                                                                        <span className="input-group-text">RPM</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </ul>
                                                    </div>
                                                </div>  
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Temperature */}
                            <div className="col-sm-6">
                                <div className="card text-muted h-100">
                                    <div className="card-body">
                                        <div className="cardtitle">
                                            <div className="row">
                                                <div className="col-12">                                            
                                                    <div className="text h5">Temperature</div>
                                                </div>
                                                <div className="col-sm-12">
                                                    {SIOTamperatureTab}
                                                    <div className="tab-content">
                                                        <div id="TamperaturePage1" className="tab-pane active">
                                                            <ul>
                                                                {/* CPU */}
                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label id="temp-cpu-title">CPU</label>
                                                                        <div id="temp-cpu" className="input-group">
                                                                            <input type="text" className="form-control" value={temperature[0]} readOnly />
                                                                            <span className="input-group-text">℃</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {/* Chipset */}
                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label id="temp-chipset-title">Chipset</label>
                                                                        <div id="temp-chipset" className="input-group">
                                                                            <input type="text" className="form-control" value={temperature[1]} readOnly />
                                                                            <span className="input-group-text">℃</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {/* System */}
                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label id="temp-system-title">System</label>
                                                                        <div id="temp-system" className="input-group">
                                                                            <input type="text" className="form-control" value={temperature[2]} readOnly />
                                                                            <span className="input-group-text">℃</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </ul>
                                                        </div>
                                                        <div id="TamperaturePage2" className="tab-pane fade">
                                                            <ul>
                                                                {/* System */}
                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label id="temp-cpu-title">System</label>
                                                                        <div id="temp-cpu" className="input-group">
                                                                            <input type="text" className="form-control" value={temperature[0]} readOnly />
                                                                            <span className="input-group-text">℃</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {/* System */}
                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label id="temp-chipset-title">System</label>
                                                                        <div id="temp-chipset" className="input-group">
                                                                            <input type="text" className="form-control" value={temperature[1]} readOnly />
                                                                            <span className="input-group-text">℃</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {/* System */}
                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label id="temp-system-title">System</label>
                                                                        <div id="temp-system" className="input-group">
                                                                            <input type="text" className="form-control" value={temperature[2]} readOnly />
                                                                            <span className="input-group-text">℃</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </ul>
                                                        </div>
                                                    </div>  
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Voltage */}
                            <div className="col-sm-12">
                                <div className="card text-muted">
                                    <div className="card-body">
                                        <div className="cardtitle">
                                            <div className="text h5">Voltage</div>
                                        </div>
                                        <div className="row">

                                            {/* VCORE */}
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label id="voltage-vcore-title">VCORE</label>
                                                    <div id="voltage-vcore" className="input-group">
                                                        <input type="text" className="form-control" value={voltage[0]} readOnly />
                                                        <span className="input-group-text">mV</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* VBAT */}
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label id="voltage-vbat-title">VBAT</label>
                                                    <div id="voltage-vbat" className="input-group">
                                                        <input type="text" className="form-control" value={voltage[3]} readOnly />
                                                        <span className="input-group-text">mV</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 12V */}
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label id="voltage-12v-title">12V</label>
                                                    <div id="voltage-12v" className="input-group">
                                                        <input type="text" className="form-control" value={voltage[6]} readOnly />
                                                        <span className="input-group-text">mV</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 1V8 */}
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label id="voltage-1v8-title">1V8</label>
                                                    <div id="voltage-1v8" className="input-group">
                                                        <input type="text" className="form-control" value={voltage[1]} readOnly />
                                                        <span className="input-group-text">mV</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 5V */}
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label id="voltage-5v-title">5V</label>
                                                    <div id="voltage-5v" className="input-group">
                                                        <input type="text" className="form-control" value={voltage[4]} readOnly />
                                                        <span className="input-group-text">mV</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* DIMM */}
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label id="voltage-dimm-title">DIMM</label>
                                                    <div id="voltage-dimm" className="input-group">
                                                        <input type="text" className="form-control" value={voltage[7]} readOnly />
                                                        <span className="input-group-text">mV</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 3V3 */}
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label id="voltage-3v3-title">3V3</label>
                                                    <div id="voltage-3v3" className="input-group">
                                                        <input type="text" className="form-control" value={voltage[2]} readOnly />
                                                        <span className="input-group-text">mV</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 5VSB */}
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label id="voltage-5vsb-title">5VSB</label>
                                                    <div id="voltage-5vsb" className="input-group">
                                                        <input type="text" className="form-control" value={voltage[5]} readOnly />
                                                        <span className="input-group-text">mV</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 3VSB */}
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label id="voltage-3vsb-title">3VSB</label>
                                                    <div id="voltage-3vsb" className="input-group">
                                                        <input type="text" className="form-control" value={voltage[8]} readOnly />
                                                        <span className="input-group-text">mV</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
