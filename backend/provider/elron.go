package provider

import (
	"encoding/json"
	"log"
	"strconv"

	"github.com/lafin/http"
)

type elronResponse struct {
	Status int `json:"status"`
	Data   []struct {
		Reis             string `json:"reis"`
		Liin             string `json:"liin"`
		ReisiAlgusAeg    string `json:"reisi_algus_aeg"`
		ReisiLoppAeg     string `json:"reisi_lopp_aeg"`
		Kiirus           string `json:"kiirus"`
		Latitude         string `json:"latitude"`
		Longitude        string `json:"longitude"`
		RongiSuund       string `json:"rongi_suund"`
		ErinevusPlaanist string `json:"erinevus_plaanist"`
		Lisateade        string `json:"lisateade"`
		PohjusTeade      string `json:"pohjus_teade"`
		AvaldaKodulehel  string `json:"avalda_kodulehel"`
		AsukohaUuendus   string `json:"asukoha_uuendus"`
		ReisiStaatus     string `json:"reisi_staatus"`
		ViimanePeatus    string `json:"viimane_peatus"`
	} `json:"data"`
	Src string `json:"src"`
	URL string `json:"url,omitempty"`
}

func parseElronResponse(response []byte) ([]Transport, error) {
	var data elronResponse
	if err := json.Unmarshal(response, &data); err != nil {
		return nil, err
	}
	records := (&data).Data
	items := make([]Transport, 0, len(records))
	for _, record := range records {
		var item = Transport{
			VehicleType: 4,
			LineNumber:  record.Liin,
		}
		if record.Reis != "" {
			value, err := strconv.Atoi(record.Reis)
			if err != nil {
				log.Printf("[ERROR] parse reis, %s", err)
				return nil, err
			}
			item.VehicleNumber = value
		}
		if record.Latitude != "" {
			value, err := strconv.ParseFloat(record.Latitude, 32)
			if err != nil {
				log.Printf("[ERROR] parse latitude, %s", err)
				return nil, err
			}
			item.Latitude = float32(value)
		}
		if record.Longitude != "" {
			value, err := strconv.ParseFloat(record.Longitude, 32)
			if err != nil {
				log.Printf("[ERROR] parse longitude, %s", err)
				return nil, err
			}
			item.Longitude = float32(value)
		}
		items = append(items, item)
	}
	return items, nil
}

// GetElronTransport - return data from Elron
func GetElronTransport() ([]Transport, error) {
	body, _, err := http.Get("https://elron.ee/map_data.json", nil)
	if err != nil {
		return nil, err
	}
	res, err := parseElronResponse(body)
	if err != nil {
		return nil, err
	}
	return res, nil
}
