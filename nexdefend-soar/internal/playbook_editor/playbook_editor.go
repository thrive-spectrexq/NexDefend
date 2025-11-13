
package playbook_editor

import (
	"io/ioutil"

	"gopkg.in/yaml.v2"

	"nexdefend/nexdefend-soar/internal/playbook"
)

// LoadPlaybooks loads playbooks from a YAML file.
func LoadPlaybooks(path string) ([]playbook.Playbook, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var playbooks []playbook.Playbook
	if err := yaml.Unmarshal(data, &playbooks); err != nil {
		return nil, err
	}

	return playbooks, nil
}
