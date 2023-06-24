package main

import (
	"encoding/json"
	"fmt"
	"sync"

	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/devfullcycle/imersao13/go/internal/infra/kafka"
	"github.com/devfullcycle/imersao13/go/internal/market/dto"
	"github.com/devfullcycle/imersao13/go/internal/market/entity"
	"github.com/devfullcycle/imersao13/go/internal/market/transformer"
)

func main() {
	// create a channel to orders in, a channel to orders out, a channel to kafka messages and a wait group
	ordersIn := make(chan *entity.Order)
	ordersOut := make(chan *entity.Order)
	wg := &sync.WaitGroup{}
	defer wg.Wait()

	kafkaMsgChan := make(chan *ckafka.Message)
	// create kafka config map (variable to connect in kafka)
	configMap := &ckafka.ConfigMap{
		"bootstrap.servers": "host.docker.internal:9094",
		"group.id":          "myGroup",
		"auto.offset.reset": "latest",
	}
	// create a new producer from infra kafka code
	producer := kafka.NewKafkaProducer(configMap)
	// create a new consumer from infra kafka code reading input topic
	kafka := kafka.NewConsumer(configMap, []string{"input"})

	// go to create a goroutine, a second thread consuming from kafka
	go kafka.Consume(kafkaMsgChan) // T2

	// recebe do canal do kafka, joga no input, processa joga no output e depois publica no kafka
	// create a new book with the channels
	book := entity.NewBook(ordersIn, ordersOut, wg)
	// run trade function from book created - third thread
	go book.Trade() // T3

	// fourth thread read the kafka message channel, add an wait group, print message, get the input
	// tranform and put on ordersin channel
	go func() {
		for msg := range kafkaMsgChan {
			wg.Add(1)
			fmt.Println(string(msg.Value))
			tradeInput := dto.TradeInput{}
			// deserialized json
			err := json.Unmarshal(msg.Value, &tradeInput)
			if err != nil {
				panic(err)
			}
			order := transformer.TransformInput(tradeInput)
			// Same channel book are using
			ordersIn <- order
		}
	}()

	// read the orders out channel (book put message in when trade match) transform in a dto and publish on kafka
	for res := range ordersOut {
		output := transformer.TransformOutput(res)
		// serialized json
		outputJson, err := json.MarshalIndent(output, "", "  ")
		fmt.Println(string(outputJson))
		if err != nil {
			fmt.Println(err)
		}
		producer.Publish(outputJson, []byte("orders"), "output")
	}
}
