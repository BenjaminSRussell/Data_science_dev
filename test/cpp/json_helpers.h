// Tiny helpers for the flat {"labels":[...],"datasets":{"Name":[...]}} shape
#ifndef TEST_JSON_HELPERS_H
#define TEST_JSON_HELPERS_H

#include <sstream>
#include <string>
#include <vector>

inline std::string arrayBody(const std::string &json, const std::string &key) {
  const std::string needle = "\"" + key + "\":[";
  size_t start = json.find(needle);
  if (start == std::string::npos)
    return "";
  start += needle.size();
  size_t end = json.find(']', start);
  return json.substr(start, end - start);
}

inline std::vector<long long> numbers(const std::string &json, const std::string &key) {
  std::vector<long long> out;
  std::stringstream ss(arrayBody(json, key));
  std::string item;
  while (std::getline(ss, item, ','))
    if (!item.empty())
      out.push_back(std::stoll(item));
  return out;
}

inline std::vector<std::string> labels(const std::string &json) {
  std::vector<std::string> out;
  std::string body = arrayBody(json, "labels");
  size_t pos = 0;
  while ((pos = body.find('"', pos)) != std::string::npos) {
    size_t end = body.find('"', pos + 1);
    out.push_back(body.substr(pos + 1, end - pos - 1));
    pos = end + 1;
  }
  return out;
}

#endif
