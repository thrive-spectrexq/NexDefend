
package rules

import (
	"io/ioutil"

	"gopkg.in/yaml.v2"
)

// Rule represents a correlation rule.
type Rule struct {
	ID          string   `yaml:"id"`
	Name        string   `yaml:"name"`
	Conditions  []string `yaml:"conditions"`
	Action      string   `yaml:"action"`
}

// LoadRules loads correlation rules from a YAML file.
func LoadRules(path string) ([]Rule, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var rules []Rule
	if err := yaml.Unmarshal(data, &rules); err != nil {
		return nil, err
	}

	return rules, nil
}
