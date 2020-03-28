/*
 * Stolen shamelessly from https://goenning.net/2017/11/08/free-and-automated-ssl-certificates-with-go/
*/
package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/tls"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/acme"
	"golang.org/x/crypto/acme/autocert"
	"gopkg.in/natefinch/lumberjack.v2"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

var l = logrus.New()

func getACMEServer() string {
	acmeServer, found := os.LookupEnv("ACME_SERVER_URL")
	if found {
		return acmeServer
	} else {
		// Let's Encrypt staging server https://letsencrypt.org/docs/staging-environment/
		return "https://acme-staging-v02.api.letsencrypt.org/directory"
	}
}

func genClient(test bool) *acme.Client {
	if test {
		acmeServer := getACMEServer()
		key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
		if err != nil {
			log.Fatal(err)
		}
		l.WithFields(logrus.Fields{
			"DirectoryServer": acmeServer,
			"Key": key,
		}).Info("Creating test acme Client")

		return &acme.Client {
			Key: key,
			DirectoryURL: acmeServer,
		}
	} else {
		return nil
	}
}

func LogCertRequest(handler http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	    l.WithFields(logrus.Fields{"RemoteAddr": r.RemoteAddr,
		    "Method": r.Method,
		    "URL": r.URL,
	    }).Info("Cert Request")
	handler.ServeHTTP(w, r)
    })
}

func main() {
	w := l.Writer()
	defer w.Close()

	dlog := logrus.New()
	dlog.Out = &lumberjack.Logger{
		Filename:   "/medir/datum/datum.log",
		MaxSize:    10, // megabytes
		Compress:   true,
	}
	dlogWriter := dlog.Writer()
	defer dlogWriter.Close()

	medirMux := http.NewServeMux()

	imageTag = os.Getenv("IMAGE_TAG")
	health := func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte("{\"status\": \"ok\", \"imageTag\": \"" + imageTag + "\"}"))

		l.WithFields(logrus.Fields{
			"ContentLength": r.ContentLength,
			"URL": r.URL,
			"Header": r.Header,
			"Body": body,
			"TransferEncoding": r.TransferEncoding,
		}).Debug("Health checked")
	}


	medirMux.HandleFunc("/health", health)
	medirMux.HandleFunc("/datum", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			body, err := ioutil.ReadAll(r.Body)
			defer r.Body.Close()
			if err != nil {
				http.Error(w, "Error reading request body", http.StatusInternalServerError)
			}
			datum := string(body)
			dlog.Info(datum)

			l.WithFields(logrus.Fields{
				"ContentLength": r.ContentLength,
				"URL": r.URL,
				"Header": r.Header,
				"Body": datum,
				"TransferEncoding": r.TransferEncoding,
			}).Debug("POST done")
		} else {
			body, _ := ioutil.ReadAll(r.Body)
			defer r.Body.Close()
			l.WithFields(logrus.Fields{
				"ContentLength": r.ContentLength,
				"URL": r.URL,
				"Header": r.Header,
				"Body": body,
				"TransferEncoding": r.TransferEncoding,
			}).Info("Invalid HTTP method")
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		}
	})
	contentDir := "/medir/html"
	medirMux.Handle("/", http.FileServer(http.Dir(contentDir)))

	certManager := autocert.Manager{
		Prompt: autocert.AcceptTOS,
		Cache:  autocert.DirCache("/medir/certs"),
		Email: "ittysensor@gmail.com",
		Client: genClient(false),
	}

	ports := []string{"8443", "8080", }

	secureServer := &http.Server{
		Addr:    ":" + ports[0],
		Handler: medirMux,
		TLSConfig: &tls.Config{
			GetCertificate: certManager.GetCertificate,
		},
		ErrorLog: log.New(w, "", 0),
	}

	l.WithFields(logrus.Fields{
		"ports": ports,
		"content": contentDir,
	}).Info("Starting medir-portal-server")

	// Let's Encrypt challenge/response non-encrypted endpoint
	go http.ListenAndServe(":" + ports[1], LogCertRequest(certManager.HTTPHandler(nil)))
	// Encrypted content using certificate from Let's Encrypt
	logrus.Fatal(secureServer.ListenAndServeTLS("", ""))
}
