/*------------------------------------------------------------------------------------------------\
  Calculate number of events, number of subjects, and adverse event rate by major, minor, and
  group.
\------------------------------------------------------------------------------------------------*/

export function cross(data, groups, id, major, minor, group) {
    var groupNames = groups
        .map(d => d.key);

  //Calculate [id] and event frequencies and rates by [major], [minor], and [group].
    var nestedData = d3.nest()
        .key(d => major == 'All' ? 'All' : d[major])
        .key(d => minor == 'All' ? 'All' : d[minor])
        .key(d => d[group])
        .rollup(d => {
            var selection = {};

          //Category
            selection.major = major === 'All' ? 'All' : d[0][major];
            selection.minor = minor === 'All' ? 'All' : d[0][minor];
            selection.label = selection.minor === 'All' ? selection.major : selection.minor;
            selection.group = d[0][group];

          //Numerator
            var ids = d3.nest()
                .key(di => di[id])
                .entries(d);
            selection.n = ids.length;
            selection.nEvents = d.length;

          //Denominator
            var currentGroup = groups
                .filter(di => di.key === d[0][group]);
            selection.tot = currentGroup[0].n;
            selection.totEvents = currentGroup[0].nEvents;

          //Rate
            selection.per = Math.round(selection.n/selection.tot*1000)/10;
            selection.perEvents = Math.round(selection.nEvents/selection.totEvents*1000)/10;

            return selection; })
        .entries(data);

  //Generate data objects for major*minor*group combinations absent in data.
    nestedData.forEach(function(dMajor) { 
        dMajor.values.forEach(function(dMinor) {
            var currentGroupList = dMinor.values
                .map(d => d.key);

            groupNames
                .forEach(function(dGroup, groupIndex) {
                    if (currentGroupList.indexOf(dGroup) === -1) {
                        var currentGroup = groups
                            .filter(d => d.key === dGroup);
                        var tot = currentGroup[0].n;
                        var totEvents = currentGroup[0].nEvents;
                        var shellMajorMinorGroup =
                            {key: dGroup
                            ,values:
                                {major: dMajor.key
                                ,minor: dMinor.key
                                ,label: dMinor.key === 'All' ? dMajor.key : dMinor.key
                                ,group: dGroup

                                ,n: 0
                                ,nEvents: 0

                                ,tot: tot
                                ,totEvents: totEvents

                                ,per: 0
                                ,perEvents: 0}};

                        dMinor.values.push(shellMajorMinorGroup);
                    }
                });

            dMinor.values
                .sort((a,b) =>
                    groups.map(group => group.key).indexOf(a.key)-
                    groups.map(group => group.key).indexOf(b.key));
        });
    });

    return nestedData
}
