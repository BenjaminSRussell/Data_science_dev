#include <iostream>
#include <string>
#include <vector>
#include <random>
#include <algorithm>

class DataGenerator {
public:
    std::string generateCategoryBreakdownJSON(int total) {
        std::vector<int> categories(4, 0);
        std::random_device rd;
        std::mt19937 gen(rd());
        int remaining = total;

        for (int i = 0; i < 4; ++i) {
            int val = randomRange(10, std::max(10, std::min(40, remaining - (4 - i) * 5)));
            remaining -= val;
            categories[i] = val;
        }

        std::ostringstream ss;
        ss << "{";
        for (int i = 0; i < 4; ++i) {
            ss << "\"category" << (i + 1) << "\":" << categories[i];
            if (i < 3) {
                ss << ",";
            }
        }
        ss << "}";

        return ss.str();
    }

private:
    int randomRange(int min, int max) {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<int> dist(min, max);
        return dist(gen);
    }
};

int main() {
    DataGenerator dg;
    std::string json = dg.generateCategoryBreakdownJSON(100);
    std::cout << json << std::endl;
    return 0;
}