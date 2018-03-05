/*
 * Stolen shamelessly from https://goenning.net/2017/11/08/free-and-automated-ssl-certificates-with-go/
*/
package main

import (
	"crypto/tls"
//	"fmt"
	"net/http"
	"golang.org/x/crypto/acme/autocert"
	log "github.com/sirupsen/logrus"
)

func main() {
	// mux := http.NewServeMux()
	// mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
	//	fmt.Fprintf(w, "<html><head/><body>Live from New York! Saturday Night Live!</body></html>")
	// })
	ports := []string{"443", "80", }
	contentDir := "/medir/html"

	certManager := autocert.Manager{
		Prompt: autocert.AcceptTOS,
		Cache:  autocert.DirCache("/medir/certs"),
	}

	server := &http.Server{
		Addr:    ":" + ports[0],
		//		Handler: mux,
		Handler: http.FileServer(http.Dir(contentDir)),
		TLSConfig: &tls.Config{
			GetCertificate: certManager.GetCertificate,
		},
	}

	log.WithFields(log.Fields{
		"ports": ports,
		"content": contentDir,
	}).Info("Starting medir-portal-server")
	go http.ListenAndServe(":" + ports[1], certManager.HTTPHandler(nil))
	err := server.ListenAndServeTLS("", "")
	log.Fatal(err)
}
