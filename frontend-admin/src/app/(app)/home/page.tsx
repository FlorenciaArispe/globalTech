"use client"

import StickyNotesBoard from '@/components/StickyNotesBoard';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Box, Container, HStack, Icon, SimpleGrid, Stat, StatHelpText, StatLabel, StatNumber, Tab, TabList, Tabs, Text, Tooltip } from '@chakra-ui/react'
import React, { useMemo, useState } from 'react'

type RangeKey = 'hoy' | 'ayer' | 'semana' | 'mes';

export default function Home() {
  const [range, setRange] = useState<RangeKey>('hoy');
  const tabs: { label: string; key: RangeKey }[] = [
    { label: 'Hoy', key: 'hoy' },
    { label: 'Ayer', key: 'ayer' },
    { label: 'Esta semana', key: 'semana' },
    { label: 'Último mes', key: 'mes' },
  ];

  const tabIndex = tabs.findIndex(t => t.key === range);

  const stats = useMemo(() => {
    return {
      total: 0,
      iphone: 0,
      otros: 0,
    };
  }, [range]);

  const rangeLabel = useMemo(() => {
    switch (range) {
      case 'hoy': return 'hoy';
      case 'ayer': return 'ayer';
      case 'semana': return 'esta semana';
      case 'mes': return 'el último mes';
    }
  }, [range]);

  return (
    <Box bg="#f6f6f6" minH="100dvh">
      <Container maxW="container.lg" pt={10} px={{ base: 4, md: 6 }}>
        <Text fontSize="30px" fontWeight={600} mb={4}>Inicio</Text>

        <Tabs
          index={tabIndex}
          onChange={(i) => setRange(tabs[i].key)}
          variant="line"
          colorScheme="blue"
        >
          <TabList overflowX="auto">
            {tabs.map(t => (
              <Tab key={t.key} whiteSpace="nowrap">{t.label}</Tab>
            ))}
          </TabList>
        </Tabs>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4} mb={6}>
          <MetricCard
            title="Ventas totales"
            value={stats.total}
            help="Cantidad total de ventas registradas en el período seleccionado."
            suffix={` ${rangeLabel}`}
          />
          <MetricCard
            title="Ventas iPhone"
            value={stats.iphone}
            help="Ventas correspondientes a la categoría iPhone en el período."
            suffix={` ${rangeLabel}`}
          />
          <MetricCard
            title="Otros equipos"
            value={stats.otros}
            help="Ventas de las demás categorías (no iPhone) en el período."
            suffix={` ${rangeLabel}`}
          />
        </SimpleGrid>

        <StickyNotesBoard />
      </Container>
    </Box>
  )
}

function MetricCard({
  title,
  value,
  help,
  suffix,
}: {
  title: string;
  value: number | string;
  help?: string;
  suffix?: string;
}) {
  return (
    <Box bg="white" borderWidth="1px" borderRadius="md" p={4}>
      <Stat>
        <HStack spacing={2} mb={2}>
          <StatLabel fontWeight={600}>{title}</StatLabel>
          {help && (
            <Tooltip label={help} hasArrow>
              <span>
                <Icon as={InfoOutlineIcon} boxSize={4} color="gray.400" />
              </span>
            </Tooltip>
          )}
        </HStack>

        <StatNumber lineHeight="1" fontSize="2xl">
          {value}
        </StatNumber>

        {suffix && (
          <StatHelpText mt={1}>{suffix}</StatHelpText>
        )}
      </Stat>
    </Box>
  );
}
