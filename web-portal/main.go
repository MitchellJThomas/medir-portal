/*
 * Stolen shamelessly from https://goenning.net/2017/11/08/free-and-automated-ssl-certificates-with-go/
*/
package main

import (
	"crypto/tls"
	//	"fmt"
	"io/ioutil"
	"net/http"
	"golang.org/x/crypto/acme/autocert"
	"log"
	"github.com/sirupsen/logrus"
	"gopkg.in/natefinch/lumberjack.v2"
)

func main() {
	l := logrus.New()
	w := l.Writer()
	defer w.Close()

	dlog := logrus.New()
	dlog.Out = &lumberjack.Logger{
		Filename:   "/medir/data/datum.log",
		MaxSize:    10, // megabytes
		Compress:   true,
	}

	dlogWriter := dlog.Writer()
	defer dlogWriter.Close()
	medirMux := http.NewServeMux()
	medirMux.HandleFunc("/datum", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			body, err := ioutil.ReadAll(r.Body)
			defer r.Body.Close()
			if err != nil {
				http.Error(w, "Error reading request body", http.StatusInternalServerError)
			}
			datum := string(body)
			dlog.Info(datum)

			logrus.WithFields(logrus.Fields{
				"ContentLength": r.ContentLength,
				"URL": r.URL,
				"Header": r.Header,
				"Body": datum,
				"TransferEncoding": r.TransferEncoding,
			}).Info("POST done")
		} else {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		}
	})
	contentDir := "/medir/html"
	medirMux.Handle("/", http.FileServer(http.Dir(contentDir)))

	certManager := autocert.Manager{
		Prompt: autocert.AcceptTOS,
		Cache:  autocert.DirCache("/medir/certs"),
	}

	ports := []string{"443", "80", }

	server := &http.Server{
		Addr:    ":" + ports[0],
		Handler: medirMux,
		TLSConfig: &tls.Config{
			GetCertificate: certManager.GetCertificate,
		},
		ErrorLog: log.New(w, "", 0),
	}

	logrus.WithFields(logrus.Fields{
		"ports": ports,
		"content": contentDir,
	}).Info("Starting medir-portal-server")

	go http.ListenAndServe(":" + ports[1], certManager.HTTPHandler(nil))
	err := server.ListenAndServeTLS("", "")

	logrus.Fatal(err)
}
