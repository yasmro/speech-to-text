function substringLetters(transcript = "", keywords = [], speechToTextResult = {}, range = 0){
    var detects = {}

    keywords.forEach((keyword) => {
        detects[keyword] = []
    })

    speechToTextResult.results?.forEach((result) => {
        Object.keys(result.keywords_result)?.forEach((keyword) => {
            detects[keyword].push(result.keywords_result[keyword].sort((a, b) => a.start_time - b.start_time))
        })
    })

    Object.keys(detects)?.forEach((keyword) => {
        detects[keyword] = detects[keyword]?.flat()
    })

    Object.keys(detects)?.forEach((keyword) => {
        var currentIndex = 0;

        detects[keyword]?.forEach((detect) => {
            var foundIndex = transcript.indexOf(keyword, currentIndex)
            var backwards = transcript.substring(foundIndex - range, foundIndex)
            var forwards = transcript.substring(foundIndex + keyword.length, foundIndex + keyword.length + range)
            detect['keyword'] = keyword;
            detect['foundIndex'] = foundIndex;
            detect['backwards'] = {
                letter: backwards,
                startIndex: foundIndex - range,
                endIndex: foundIndex - 1
            };
            detect['forwards'] = {
                letter: forwards,
                startIndex: foundIndex + keyword.length,
                endIndex: foundIndex + keyword.length + range - 1
            };
            currentIndex = foundIndex + keyword.length;
            
        })
        
    })

    return detects
}

exports.substringLetters = substringLetters