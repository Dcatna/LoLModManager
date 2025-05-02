package main

import (
	"fmt"
	"testing"
)

func Test(t *testing.T) {
	a := NewApp()

	fmt.Println(a.FindLeaugeDownload())
	t.Fail()
}
