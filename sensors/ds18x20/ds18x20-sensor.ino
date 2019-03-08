// Use this include for the Web IDE:
#include "OneWire/OneWire.h"

struct Datum {
    Datum() {
        failCode = 1;
        temp = 0.0;
        ts = Time.now();
    }
    Datum(float tem) {
        failCode = 0;
        temp = tem;
        ts = Time.now(); // Wrong source... need SparkTime for NTP values
    }
    Datum(float tem, uint8_t fail) {
        failCode = fail;
        temp = tem;
        ts = Time.now(); // Wrong source... need SparkTime for NTP values
    }

    float temp; // Degrees Celcius
    unsigned int ts; // Sample time stamp
    unsigned char failCode; // a failure code in the event humidity and temp couldn't be read
};

class DS18x20 {
    private:
        OneWire _sensor;
        static const uint8_t _history_max_items = 8;
        static const int datums_size = 256 + 128;
        Datum _history[_history_max_items];
        uint8_t _history_index;
        String datumToString(Datum);
        Datum readSensor(void);
        void debug(String message);

    public:
        char datums[datums_size];
        DS18x20(int pin);
        String readDatum(void);
};

DS18x20::DS18x20(int pin) : _sensor(pin), _history_index(0) {}

String DS18x20::readDatum() {
    Datum d = readSensor();

    if (_history_index >= _history_max_items) {
        _history_index = 0;
    }
    _history[_history_index] = d;
    _history_index++;

    String hist = "[";
    for(int i = 0; i<_history_max_items; i++) {
        hist = hist + datumToString(_history[i]);
        if (i < _history_max_items - 1)
            hist = hist + ',';
    }
    hist = hist + ']';
    hist.toCharArray(datums, datums_size);

    return datumToString(d);
}

String DS18x20::datumToString(Datum d) {
    String ret;
     if (d.failCode == 0)
        ret = "{\"t\":" + String(d.temp, 2) + ','
            + "\"ts\":" + String(d.ts) + '}';
    else
        ret = "{\"fc\":" + String(d.failCode) + ','
            + "\"ts\":" + String(d.ts) + '}';
    return ret;
}

// The following was taken from https://community.particle.io/t/ds18b20-temp-sensor-playing-up/28772/10
// It assumes monitoring a newer DS1820 chip and that there is only one device
// on the OneWire bus (the DS1820 chip), thus using skip
Datum DS18x20::readSensor(void) {
    byte i;
    byte present = 0;
    byte type_s;
    byte data[12];
    byte addr[8];

    _sensor.reset();
    _sensor.skip();
    _sensor.write(0x44, 1);        // start conversion, with parasite power on at the end
    delay(750);

    _sensor.reset();
    _sensor.skip();
    _sensor.write(0xBE);         // Read Scratchpad

    for ( i = 0; i < 9; i++) {           // we need 9 bytes
        data[i] = _sensor.read();
    }

     if (OneWire::crc8(data, 8) != data[8]) {
            // debug("CRC is not valid!");
            return Datum(0.0, 2);
     }

    // String crc = String("CRC=");
    // String crc_data = String(OneWire::crc8(data, 8), HEX);
    // crc.concat(crc_data);
    // debug(crc);

    // Convert the data to actual temperature
    // because the result is a 16 bit signed integer, it should
    // be stored to an "int16_t" type, which is always 16 bits
    // even when compiled on a 32 bit processor.
    int16_t raw = (data[1] << 8) | data[0];

    // The following assumes newer DS1820 chips e.g. DS18B20, DS1822
    byte cfg = (data[4] & 0x60);
    // at lower res, the low bits are undefined, so let's zero them
    if (cfg == 0x00) raw = raw & ~7;  // 9 bit resolution, 93.75 ms
    else if (cfg == 0x20) raw = raw & ~3; // 10 bit res, 187.5 ms
    else if (cfg == 0x40) raw = raw & ~1; // 11 bit res, 375 ms
    //// default is 12 bit resolution, 750 ms conversion time

    Datum goodData((float)raw / 16.0);
    return goodData;
}


// This library can be tested on the Core/Photon by running the below
// DS18x20 example from PJRC:

// OneWire DS18S20, DS18B20, DS1822 Temperature Example
//
// http://www.pjrc.com/teensy/td_libs_OneWire.html
//
// The DallasTemperature library can do all this work for you!
// http://milesburton.com/Dallas_Temperature_Control_Library

// OneWire ds(D0);  // on pin D0 (a 4.7K resistor is necessary)

// Log message to cloud, message is a printf-formatted string
void DS18x20::debug(String message) {
   // char msg [50];
   //    sprintf(msg, message.c_str());
   Particle.publish("DEBUG", message);
}

#define ONE_DAY_MILLIS (24 * 60 * 60 * 1000)
DS18x20 sensors(D0);
uint8_t count;
void setup() {
    Particle.variable("datums", sensors.datums, STRING);
    count = 0;
}

void loop(void) {
    unsigned long lastSync = millis();
    String dat = sensors.readDatum();
    count++;
    if (count >= 10) {
        Particle.publish("dat", dat);
        count = 0;
    }

    if (millis() - lastSync > ONE_DAY_MILLIS) {
       // Request time synchronization from the Spark Cloud
       Particle.syncTime();
       lastSync = millis();
    }
    delay(2000);
}
