export const DEBUG = 1; // 如果是用自己電腦開發，DEBUG改1

export let redist = 1; // whether there is microsoft C++ dll

// define pointer
const IntPtr = window.PTR(); // Int Pointer
const CharPtr = window.PTRc(); // Char Pointer
const uIntPtr = window.PTRu(); // Unsigned int pointer
const shortPtr = window.PTRshort(); // short pointer

// enum setup
export enum EAPI
{
    EAPI_STATUS_NOT_INITIALIZED = 0xFFFFFFFF,
    EAPI_STATUS_INITIALIZED = 0xFFFFFFFE,
    EAPI_STATUS_ALLOC_ERROR = 0xFFFFFFFD,
    EAPI_STATUS_DRIVER_TIMEOUT = 0xFFFFFFFC,
    EAPI_STATUS_DEVICE_NOT_READY = 0xFFFFFFFB,
    EAPI_STATUS_INVALID_PARAMETER = 0xFFFFFEFF,
    EAPI_STATUS_INVALID_BLOCK_ALIGNMENT = 0xFFFFFEFE,
    EAPI_STATUS_INVALID_BLOCK_LENGTH = 0xFFFFFEFD,
    EAPI_STATUS_INVALID_DIRECTION = 0xFFFFFEFC,
    EAPI_STATUS_INVALID_BITMASK = 0xFFFFFEFB,
    EAPI_STATUS_RUNNING = 0xFFFFFEFA,
    EAPI_STATUS_UNSUPPORTED = 0xFFFFFCFF,
    EAPI_STATUS_NOT_FOUND = 0xFFFFFBFF,
    EAPI_STATUS_TIMEOUT = 0xFFFFFBFD,
    EAPI_STATUS_READ_ERROR = 0xFFFFFAFF,
    EAPI_STATUS_WRITE_ERROR = 0xFFFFFAFE,
    EAPI_STATUS_MORE_DATA = 0xFFFFF9FF,
    EAPI_STATUS_ERROR = 0xFFFFF0FF,
    EAPI_STATUS_SUCCESS = 0x00000000,

    EAPI_ID_BOARD_MANUFACTURER_STR = 0,
    EAPI_ID_BOARD_NAME_STR = 1,
    EAPI_ID_BOARD_REVISION_STR = 2,
    EAPI_ID_BOARD_SERIAL_STR = 3,
    EAPI_ID_BOARD_BIOS_REVISION_STR = 4,
    EAPI_ID_BOARD_HW_REVISION_STR = 5,
    EAPI_ID_BOARD_PLATFORM_TYPE_STR = 6,
    EAPI_ID_EC_REVISION_STR = 7,

    EAPI_ID_GET_EAPI_SPEC_VERSION = 0,
    EAPI_ID_BOARD_BOOT_COUNTER_VAL = 1,
    EAPI_ID_BOARD_RUNNING_TIME_METER_VAL = 2,
    EAPI_ID_BOARD_PNPID_VAL = 3,
    EAPI_ID_BOARD_PLATFORM_REV_VAL = 4,
    EAPI_ID_AONCUS_HISAFE_FUCTION = 5,
    EAPI_ID_BOARD_DRIVER_VERSION_VAL = 0x10000,
    EAPI_ID_BOARD_LIB_VERSION_VAL = 0x10001,

    EAPI_ID_HWMON_CPU_TEMP = 0x20000,
    EAPI_ID_HWMON_FAN_CPU = 0x22000,
    EAPI_ID_HWMON_VOLTAGE_VCORE = 0x21004,
    EAPI_KELVINS_OFFSET = 2731,

    EAPI_ID_AONCUS_SMBUS_EXTERNAL_1 = 10,
    EAPI_ID_I2C_EXTERNAL = 0,
    EAPI_ID_AONCUS_I2C_EXTERNAL_2 = 3,
    EAPI_ID_AONCUS_I2C_EXTERNAL_3 = 4,
    EAPI_ID_AONCUS_I2C_EXTERNAL_4 = 5,
    EAPI_ID_AONCUS_I2C_EXTERNAL_5 = 6,
    EAPI_ID_AONCUS_I2C_EXTERNAL_6 = 7,
    EAPI_ID_AONCUS_I2C_EXTERNAL_7 = 8,
    EAPI_ID_AONCUS_I2C_EXTERNAL_8 = 9,


    EAPI_ID_BACKLIGHT_1 = 0,
    EAPI_ID_BACKLIGHT_2 = 1,
    EAPI_ID_BACKLIGHT_3 = 2,
    EAPI_ID_BACKLIGHT_4 = 3,

    EAPI_FUNC_BITMASK_SYSTEM = 0x80,
    EAPI_FUNC_BITMASK_MONITOR = 0x40,
    EAPI_FUNC_BITMASK_DIO = 0x20,
    EAPI_FUNC_BITMASK_WATCHDOG = 0x10,
    EAPI_FUNC_BITMASK_SFAN = 0x08,
    EAPI_FUNC_BITMASK_SMBUS = 0x04,
    EAPI_FUNC_BITMASK_BKLIGHT = 0x02,

    BFPI_ID_SFAN_LOWEST_POINT = 0x00,
    BFPI_ID_SFAN_HIGHEST_POINT = 0x10,
    BFPI_ID_SFAN_SECOND_LOW_POINT = 0x20,
    BFPI_ID_SFAN_THIRD_LOW_POINT = 0x30,

}

/**
 * Function Configuration
 */
const ApiConfig = {
    EApiLibInitialize: ["UInt32", []],
    EApiLibUnInitialize: ["UInt32", []],
    EApiI2CReadTransfer: ["UInt32", ["UInt32", "UInt32", "UInt32", shortPtr, "UInt32", "UInt32"]],
    EApiI2CWriteTransfer: ["UInt32", ["UInt32", "UInt32", "UInt32", shortPtr, "UInt32"]],
    EApiI2CWriteReadRaw: ["UInt32", ["UInt32", "UInt32", IntPtr, "UInt32", IntPtr, "UInt32", "UInt32"]]
};

// Get System info by web api
const IsDataWidth64Bit = () => {
    return (navigator.userAgent.indexOf("WOW64") !== -1 || 
            navigator.userAgent.indexOf("Win64") !== -1 )
}

// check if redist package is installed
let path = "";
try
{    
    // Determine whether the computer is 32 bit or 64 bit
    const dataWidth = IsDataWidth64Bit();
    if (dataWidth === false)
    {
        path = "dll/32bit/aaeonEAPI.dll";
    }
    else
    {
        path = "dll/64bit/aaeonEAPI.dll";
    }

} catch (exception)
{
    redist = 0;
    path = "dll/64bit/aaeonEAPI.dll";
    window.showError(exception.message, "Please install Microsoft Visual C++ Redistributable package manually from Microsoft's Website.");
}

// Get Board info by dll
export const funcs = window.RegistDll(process.env.NODE_ENV, path, ApiConfig);

export function handleError(error: any)
{
    if (!DEBUG)
    {
        switch (error)
        {
            case EAPI.EAPI_STATUS_NOT_INITIALIZED:
                window.showError("EAPI_STATUS_NOT_INITIALIZED", "The EAPI library is not yet or unsuccessfully initialized.");
                break;
            case EAPI.EAPI_STATUS_INITIALIZED:
                break;
            case EAPI.EAPI_STATUS_ALLOC_ERROR:
                window.showError("EAPI_STATUS_ALLOC_ERROR", "Memory Allocation Error.");
                break;
            case EAPI.EAPI_STATUS_DRIVER_TIMEOUT:
                window.showError("EAPI_STATUS_DRIVER_TIMEOUT", "Time out in driver. This is Normally caused by hardware/software semaphore timeout.");
                break;
            case EAPI.EAPI_STATUS_DEVICE_NOT_READY:
                window.showError("EAPI_STATUS_DEVICE_NOT_READY", "Hardware is not ready.");
                break;
            case EAPI.EAPI_STATUS_INVALID_PARAMETER:
                window.showError("EAPI_STATUS_INVALID_PARAMETER", "One or more of the EAPI function call parameters are out of range.");
                break;
            case EAPI.EAPI_STATUS_INVALID_BLOCK_ALIGNMENT:
                window.showError("EAPI_STATUS_INVALID_BLOCK_ALIGNMENT", "The Block Alignment is incorrect.");
                break;
            case EAPI.EAPI_STATUS_INVALID_BLOCK_LENGTH:
                window.showError("EAPI_STATUS_INVALID_BLOCK_LENGTH", "Block length is too long.");
                break;
            case EAPI.EAPI_STATUS_INVALID_DIRECTION:
                window.showError("EAPI_STATUS_INVALID_DIRECTION", "The current Direction Argument attempts to set GPIOs to an unsupported directions. I.E. Setting GPIO Input to Output.");
                break;
            case EAPI.EAPI_STATUS_INVALID_BITMASK:
                window.showError("EAPI_STATUS_INVALID_BITMASK", "The Bitmask Selects bits/GPIOs which are not supported for the current ID.");
                break;
            case EAPI.EAPI_STATUS_RUNNING:
                window.showError("EAPI_STATUS_RUNNING", "Watchdog timer already started.");
                break;
            case EAPI.EAPI_STATUS_UNSUPPORTED:
                window.showError("EAPI_STATUS_UNSUPPORTED", "This function or ID is not supported in this hardware configuration.");
                break;
            case EAPI.EAPI_STATUS_NOT_FOUND:
                window.showError("EAPI_STATUS_NOT_FOUND", "I2C Device Error No Acknowledge for Device Address, 7 Bit Address Only. 10 Bit Address may cause Write error if two 10 Bit addressed devices present on the bus.");
                break;
            case EAPI.EAPI_STATUS_TIMEOUT:
                window.showError("EAPI_STATUS_TIMEOUT", "EApi I2C functions specific. The addressed I2C bus is busy or there is a bus collision. The I2C bus is in use. Either CLK or DAT are low. Arbitration loss or bus Collision, data remains low when writing a 1.");
                break;
            case EAPI.EAPI_STATUS_READ_ERROR:
                window.showError("EAPI_STATUS_READ_ERROR", "I2C Read Error Not Possible to detect. Storage Read Error.");
                break;
            case EAPI.EAPI_STATUS_WRITE_ERROR:
                window.showError("EAPI_STATUS_WRITE_ERROR", "I2C Write Error No Acknowledge received after writing any Byte after the First Address Byte. Can be caused by unsupported Device Command/Index; Ext Command/Index used on Standard Command/Index Device; 10 Bit Address Device Not Present; Storage Write Error;");
                break;
            case EAPI.EAPI_STATUS_MORE_DATA:
                window.showError("EAPI_STATUS_MORE_DATA", "The amount of available data exceeds the buffer size. Storage buffer overflow was prevented. Read count was larger than the defined buffer length. Read Count > Buffer Length.");
                break;
            case EAPI.EAPI_STATUS_ERROR:
                window.showError("EAPI_STATUS_ERROR", "Generic error message. No further error details are available.");
                break;
            case EAPI.EAPI_STATUS_SUCCESS:
                break;
        }
    }
}
