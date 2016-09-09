FROM kibana
RUN ls -la
RUN ls -la bin
RUN ./bin/plugin --install elasticsearch/marvel
RUN ./bin/plugin --install elasticsearch/sense
CMD ./bin/kibana
