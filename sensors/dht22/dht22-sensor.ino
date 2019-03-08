#define MAXTIMINGS 85

//   Using a DHT22 on pin D2
//   Copied from https://community.spark.io/t/dht22-dht11-and-similar-blocking-version/998/39
struct Datum {
    Datum() { 
        failCode = 1; 
        humidity = -1.0; temp = 0.0;
        ts = Time.now(); 
    }
    Datum(float hum, float tem) {
        failCode = 0;
        humidity = hum; temp = tem;
        ts = Time.now(); // Wrong source... need SparkTime for NTP values
    }
    Datum(uint8_t fail) {
        failCode = fail;
        humidity = -1.0; temp = 0.0;
        ts = Time.now(); // Wrong source... need SparkTime for NTP values
    }
    
    float humidity; // percentage of H2O vapor
    float temp; // Degrees Celcius
    unsigned int ts; // Sample time stamp
    unsigned char failCode; // a failure code in the event humidity and temp couldn't be read
};

class DHT {
    private:
        uint8_t _pin, _count;
        static const uint8_t _history_max_items = 8;
        static const int datums_size = 256 + 128;
        Datum _history[_history_max_items];
        uint8_t _history_index;
        Datum readDHT22Sensor(uint8_t, uint8_t);
        String datumToString(Datum);

    public:
        char datums[datums_size];
        DHT(uint8_t pin, uint8_t count=6);
        void begin(void);
        String readDatum(void);
};

DHT::DHT(uint8_t pin, uint8_t count) {
    _pin = pin;
    _count = count; 
    _history_index = 0;
}

void DHT::begin(void) {
    // set up the pins!
    pinMode(_pin, INPUT);
    digitalWrite(_pin, HIGH);
}

String DHT::readDatum() {
    Datum d = readDHT22Sensor(_pin, _count);
    
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

String DHT::datumToString(Datum d) {
    String ret;
     if (d.failCode == 0)
        ret = "{\"t\":" + String(d.temp, 2) + ',' 
            + "\"h\":"+ String(d.humidity, 2) + ','
            + "\"ts\":" + String(d.ts) + '}';
    else
        ret = "{\"fc\":" + String(d.failCode) + ',' 
            + "\"ts\":" + String(d.ts) + '}';
    return ret;
}

Datum DHT::readDHT22Sensor(uint8_t pin, uint8_t counter_thingy)  {
    uint8_t laststate = HIGH;
    uint8_t counter = 0;
    uint8_t j = 0, i;
    uint8_t bits[6];
  
    // pull the pin high and wait 250 milliseconds
    digitalWrite(pin, HIGH);
    delay(250);
    
    // now pull it low for ~20 milliseconds
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
    delay(20);
    noInterrupts();
    digitalWrite(pin, HIGH);
    delayMicroseconds(40);
    pinMode(pin, INPUT);

    // read in timings
    for ( i=0; i< MAXTIMINGS; i++) {
        counter = 0;

        while (digitalRead(pin) == laststate) {
            counter++;
            delayMicroseconds(1);

            if (counter == 255)
                break;
        }

        laststate = digitalRead(pin);

        if (counter == 255)
            break;

        // ignore first 3 transitions
        if ((i >= 4) && (i%2 == 0)) {
            // shove each bit into the storage bytes
            bits[j/8] <<= 1;

            if (counter > counter_thingy)
                bits[j/8] |= 1;

            j++;
        }
    }

    interrupts();

    // check we read 40 bits
    if (j < 40) {
        return Datum(2); // fail code
    }
    //  check the checksum matches
    if ((bits[4] != ((bits[0] + bits[1] + bits[2] + bits[3]) & 0xFF))) {
       return Datum(3); // fail code
    }

    Datum goodData(calcHumidity(bits[0], bits[1]), calcTemp(bits[2], bits[3]));
    return goodData;
}

inline float calcTemp(uint8_t t0, uint8_t t1) {
    float temp = t0 & 0x7F;
    temp *= 256;
    temp += t1;
    temp /= 10;
    if (t0 & 0x80)
        temp *= -1;
    return temp;
}

inline float calcHumidity(uint8_t h0, uint8_t h1) {
    float humidity = h0;
    humidity *= 256;
    humidity += h1;
    humidity /= 10;
    return humidity;
}

DHT dht(D2); // Digital pin D2
uint8_t count;
#define ONE_DAY_MILLIS (24 * 60 * 60 * 1000)
unsigned long lastSync = millis();

void setup() {
    Spark.variable("datums", dht.datums, STRING);
    dht.begin();
    count = 0;
} 

void loop() {
    String d = dht.readDatum();
    count++;
    if (count >= 10) {
        Spark.publish("dat", d);
        count = 0;
    }
    if (millis() - lastSync > ONE_DAY_MILLIS) {
       // Request time synchronization from the Spark Cloud
       Spark.syncTime();
       lastSync = millis();
    }
    delay(2000);
}
